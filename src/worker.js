/* eslint-disable no-promise-executor-return */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
const storage = require("node-persist");
const system = require("./utill/system.js");
const { logMessage } = require("./utill/util.js");
const WebSocketClient = require("./utill/socket.js");
const { EventNameSocket } = require("./utill/enum.js");
const docker = require("./utill/docker.js");
const env = require('../env.json')

storage.initSync({ dir: "src/.data" });
const socket = new WebSocketClient();



const verifyWorker = async () => {
  // Lắng nghe sự kiện BenchMarkTask
  await socket.on(EventNameSocket.BenchMarkTask, async (data) => {
    try {
      await logMessage("Benchmark task start ....", data);
      await logMessage("message", "Benchmark task start...");
      await logMessage(
        "benchmark-task",
        JSON.stringify({
          message: "Benchmark task start ....",
          data,
        })
      );
      await logMessage("benchmark-task-receive: ", data);
      const benchMark = await system.benchMarkTask();
      await logMessage("benchmark-task-send: ", { ...benchMark });

      // if (benchMark) benchMark.gpu = gpu;
      await socket.send(EventNameSocket.BenchMarkTaskResult, benchMark);
      // event.sender.send('benchmark-task', {
      //   message: 'Benchmark task end ....',
      //   data: benchMark
      // });
      await logMessage("Benchmark task end");
      logMessage("message", "Benchmark task end!");
    } catch (error) {
      // event.sender.send('benchmark-task', {
      //   message: 'Error in BenchMarkTask',
      //   data: error
      // });
      await logMessage("Error in BenchMarkTask", error);
      logMessage("message", "Error in BenchmarkTask!");
    }
  });
};
const systemStatus = async () => {
  const systemInfo = await system.getSystemInfo();
  await logMessage("resource", systemInfo);
  setInterval(async () => {
    const speed_monitor = await system.getNetworkStats();
    const system_stats = await system.getSystemStats();
    await logMessage("system-status", {
      ...speed_monitor,
      ...system_stats,
    });
    storage.setItem("resource", systemInfo);
    storage.setItem("system-status", { ...speed_monitor, ...system_stats });
  }, 1000);
};
const startSystemMonitoring = async () => {
  const intervalTime = Number(env.TIME_INTERVAL) || 30000;
  setInterval(async () => {
    try {
      await logMessage("system usage!");
      const reportSystem = await system.reportSystemInfo();
      await logMessage("System usage report", reportSystem);
      await socket.send(EventNameSocket.SendSystemInfoUsage, reportSystem);
    } catch (error) {
      await logMessage("Error reporting system usage", error);
    }
  }, intervalTime);
};

let todo = false;
const createGPUContainer = async () => {
  await socket.on(EventNameSocket.CreateGpuContainer, async (data) => {
    todo = true;
    try {
      await logMessage("Create GPU container task start ....", data);
      logMessage("message", "Create GPU container task start...");
      await docker.createContainer(data, socket);
      await logMessage("Create GPU container task end");
    } catch (error) {
      await logMessage("Error in CreateGpuContainer", error);
      logMessage("message", "Error in Create GPU Container");
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      todo = false;
    }
  });
};

const queryOrder = async () => {
  const intervalTime = Number(env.TIME_INTERVAL) || 30000;
  setInterval(async () => {
    if (!todo) {
      try {
        await socket.send(EventNameSocket.QueryOrder, {});
        await logMessage("Query order sent");
      } catch (error) {
        await logMessage("Error in query order", error);
      }
    }
  }, intervalTime);
};
const statusDocker = async () => {
  setInterval(async () => {
    console.log("status docker");
    const status = await docker.getStatusDocker();
    if (status) {
      const containers = await docker.getAllContainers();
      if (socket.socket?.connected) {
        await docker.conntainerUsages(socket);
      }
      await logMessage("docker", containers);
      await storage.setItem("docker", containers);
    } else {
      await storage.getItem("docker", "Docker is not availale!");
    }
  }, 5000);
};

const main = async () => {
  try {
    await verifyWorker();
    await queryOrder();
    await statusDocker();
    await createGPUContainer();
    await systemStatus();
    await startSystemMonitoring();
    await logMessage("Application started successfully");
  } catch (error) {
    await logMessage("Error starting application", error);
  }
};
// main();
let check = false;
setInterval(async () => {
  if (!check) {
    const wallet = await storage.get("wallet");
    const peaqDID = await storage.get("PeaqDID");
    console.log("wallet: ", wallet);
    console.log("peaqDID", peaqDID);
    if (wallet && peaqDID) {
      check = true;
      main();
    } else {
      console.log(
        "Your wallet is not connected and your DID (Decentralized Identifier) has not been registered. Please complete these steps to proceed."
      );
    }
  }
}, 5000);
console.log("start!!!");
async function cleanup() {
  console.log("Performing cleanup tasks...");
  await storage.removeItem("resource");
  await storage.removeItem("system-status");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Cleanup completed.");
}

// Lắng nghe SIGINT (nhấn Ctrl+C)
process.on("SIGINT", async () => {
  console.log("Caught SIGINT (Ctrl+C)");
  await cleanup();
  process.exit(0); // Thoát hoàn toàn
});

// Lắng nghe SIGTERM (tín hiệu từ PM2)
process.on("SIGTERM", async () => {
  console.log("Caught SIGTERM (PM2 stop)");
  await cleanup();
  process.exit(0);
});

// Lắng nghe lỗi không được bắt
function cleanupSync() {
  console.log("Performing synchronous cleanup...");
}
process.on("uncaughtException", (err) => {
  console.error("Unhandled exception:", err);
  cleanupSync();
  process.exit(1);
});
