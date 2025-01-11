const WebSocketClient = require("./socket");
const { EventNameSocket } = require("./enum");
const { reportSystemInfo } = require("./system");
const env = require("../../env.json");
const logMessage = async (message = "", data = {}) => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = String(now.getFullYear()).slice(-2);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  console.log(
    `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${message}`,
    data
  );
};

const startSystemMonitoring = async () => {
  const intervalTime = env.TIME_INTERVAL || 60000;
  const intervalReportSystem = setInterval(async () => {
    try {
      const reportSystem = await reportSystemInfo();
      await logMessage("System usage report", reportSystem);
    } catch (error) {
      await logMessage("Error reporting system usage", error);
    }
  }, intervalTime);
};

const socketConnect = async () => {
  try {
    const socket = new WebSocketClient();
    await socket.connect();
    await socket.on(EventNameSocket.BenchMarkTask, async (data) => {
      await logMessage("Bench mark task start ....", data);
      socket.send(EventNameSocket.BenchMarkTaskResult, {
        status: "Success",
        data,
      });
      await logMessage("Bench mark task end");
      return true;
    });
    await socket.on(EventNameSocket.CreateGpuContainer, async (data) => {
      await logMessage("Create gpu container task start ....", data);
      socket.send(EventNameSocket.CreateGpuContainerResult, {
        status: "Success",
        data,
      });
      await logMessage("Create gpu container task end");
      return true;
    });
  } catch (error) {
    await logMessage("Error socket", error);
  }
};

module.exports = {
  logMessage,
  startSystemMonitoring,
  socketConnect,
};
