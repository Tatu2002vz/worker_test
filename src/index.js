/* eslint-disable func-names */
// import Web3 from 'web3';
const readline = require("readline");
const storage = require("node-persist");
const WalletManager = require("./utill/wallet");
const axios = require("axios");
const env = require("../env.json");

const walletManager = new WalletManager();
storage.initSync({ dir: "src/.data" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

async function checkExist() {
  const rs = await storage.getItem("wallet");
  if (rs && rs.address) {
    return true;
  }
  return false;
}

function printKaisarLogo() {
  console.log(
    "**********************************************************************************************"
  );
  console.log(
    "                                                                           "
  );
  console.log(
    "oooo    oooo         .o.         ooooo    .oooooo..o        .o.          ooooooooo.   "
  );
  console.log(
    "`888   .8P'         .888.        `888'   d8P'    `Y8       .888.        `888   `Y88. "
  );
  console.log(
    " 888  d8'          .8\"888.        888    Y88bo.           .8\"888.        888   .d88' "
  );
  console.log(
    " 88888[           .8' `888.       888     `\"Y8888o.      .8' `888.       888ooo88P'  "
  );
  console.log(
    ' 888`88b.        .88ooo8888.      888         `"Y88b    .88ooo8888.      888`88b.    '
  );
  console.log(
    " 888  `88b.     .8'     `888.     888    oo     .d8P   .8'     `888.     888  `88b.  "
  );
  console.log(
    'o888o  o888o   o88o     o8888o   o888o   8""88888P\'   o88o     o8888o    o888o  o888o '
  );
  console.log(
    "                                                                           "
  );
  console.log(
    "**********************************************************************************************"
  );
  console.log("Welcome to Kaisar Wallet CLI!! ");
  console.log("1. Create a new wallet");
  console.log("2. Import existing wallet");
  console.log("3. Register device");
  console.log("4. Check status");
  console.log(
    "**********************************************************************************************"
  );
}

function validateEmail(email) {
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
}

async function handleCommand(input) {
  const parts = input.split(" ");
  const command = parts[0];
  let intervalFlag = false;

  switch (command) {
    case "1": {
      const exist = await checkExist();
      if (exist) {
        console.log(
          "A wallet already exists. Please proceed with a different option."
        );
        break;
      }
      console.log("Create a new password for wallet!");
      const password = await new Promise((resolve) => {
        rl.question("New Password: ", (input) => {
          resolve(input);
        });
      });

      const rs = await walletManager.createWallet(password);
      if (rs?.address && rs.privateKey) {
        console.log("Create new wallet success!");
        console.log("Address: ", rs.address);
        console.log("Private Key: ", rs.privateKey);
        console.log(
          "Please make sure to securely store your private key. You will need it to import your wallet in the future."
        );
        await storage.setItem("wallet", {
          address: rs.address,
          encryptKeyStore: rs.encryptKeyStore,
        });
        await storage.setItem("passKey", password);
      } else {
        console.log("Create new wallet failed!");
      }
      break;
    }
    case "2": {
      const exist = await checkExist();
      if (exist) {
        console.log(
          "A wallet already exists. Please proceed with a different option."
        );
        break;
      }
      console.log("Create a new password for wallet!");
      const password = await new Promise((resolve) => {
        rl.question("New Password: ", (input) => {
          resolve(input);
        });
      });
      console.log("Please input private key to import wallet!");

      const privateKey = await new Promise((resolve) => {
        rl.question("Private Key: ", (input) => {
          resolve(input);
        });
      });

      try {
        const rs = await walletManager.importWallet(privateKey, password);
        if (rs?.address && rs.privateKey) {
          console.log("Import wallet success!");
          console.log("Address: ", rs.address);
          await storage.setItem("wallet", {
            address: rs.address,
            encryptKeyStore: rs.encryptKeyStore,
          });
          await storage.setItem("passKey", password);
        } else {
          console.log("Import wallet failed!");
        }
      } catch (error) {
        console.log("Error importing wallet: ", error);
      }
      break;
    }

    case "3": {
      try {
        const exploerAPI = env.EXPLOER_API + "/kaisar/peaq-did";
        let testEmail = false;
        let flag = false;
        let email = await storage.getItem("email");
        if (email && validateEmail(email)) {
          console.log("Your email is: ", email);
        } else {
          do {
            console.log("Please enter your email to continue.");
            email = await new Promise((resolve) => {
              rl.question("Email: ", (input) => {
                resolve(input);
              });
            });
            await storage.setItem("email", email);

            testEmail = validateEmail(email);
            if (!testEmail) console.log("Please enter a valid email address.");
          } while (!testEmail);
        }
        const wallet = await storage.getItem("wallet");
        const dataPost = {
          email,
          address: wallet.address,
          tag: "kaisar_worker",
        };
        const rs = await axios.post(exploerAPI, dataPost, {
          headers: {
            "x-api-key": env.X_API_KEY,
          },
        });
        console.log("result: ", rs.data.data);
        await storage.setItem("PeaqDID", rs.data.data.value);
      } catch (error) {
        console.log("Error when register device! ", error);
      }
      break;
    }
    case "4": {
      const wallet = await storage.getItem("wallet");
      const { address } = wallet;
      console.log("Address: ", address);
      const email = await storage.getItem("email");
      console.log("Email: ", email);
      const peaqDID = await storage.getItem("PeaqDID");
      console.log("Peaq DID: ", peaqDID);
      const resource = await storage.getItem("resource");
      const systemStatus = await storage.getItem("system-status");
      const dockerStatus = await storage.getItem("docker");
      const data = { ...resource, ...systemStatus, ...dockerStatus };
      console.log("Spect: ", data);
      break;
    }
    case "5": {
      intervalFlag = true;
      let intervalId;

      if (!intervalId) {
        setInterval(async () => {
          readline.cursorTo(process.stdout, 0, 0); // Move cursor to start
          readline.clearScreenDown(process.stdout); // Clear screen after cursor
          const resource = await storage.getItem("resource");
          console.log("Resource: ", resource);
          const systemStatus = await storage.getItem("system-status");
          console.log("System status: ", systemStatus);
        }, 2000);
      }
      break;
    }
    default:
      console.log(`Unknown sub-command: ${command}`);
      break;
  }

  return intervalFlag;
}

async function start() {
  await storage.setItem("docker", "");
  await storage.setItem("resource", "");
  await storage.setItem("system-status", "");
  const networkId = await walletManager.isConnected();
  console.log(`Connected to network with ID: ${networkId}`);
  let count = 0;
  function askQuestion() {
    if (count % 2 === 0) printKaisarLogo();
    count++;
    rl.question("Enter your input command: ", async (input) => {
      if (input === "exit") {
        console.log("Exiting the program.");
        rl.close();
        return;
      }

      const rs = await handleCommand(input);
      if (!rs) {
        askQuestion();
      }
    });
  }

  askQuestion();
}

start();
