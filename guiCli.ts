/* eslint-disable func-names */
// import Web3 from 'web3';
import fs from "fs";
const readline = require("readline");
const storage = require("node-persist");
import WalletManager from "./walletManager";

const walletManager = new WalletManager();
storage.initSync({ dir: "./data" });
// const web3 = new Web3('https://wss-async.agung.peaq.network/');

interface Wallet {
  address: string;
  privateKey: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

// function createWallet(): void {
//   try {
//     console.log(`Creating new wallet...`);

//     const wallet = web3.eth.accounts.create();
//     console.log('Address:', wallet.address);
//     console.log('Private Key:', wallet.privateKey);

//     const filePath = 'wallets.json';

//     let wallets: Wallet[] = [];
//     if (fs.existsSync(filePath)) {
//       const data = fs.readFileSync(filePath);
//       wallets = JSON.parse(data.toString());
//     }

//     wallets.push(wallet);

//     fs.writeFileSync(filePath, JSON.stringify(wallets, null, 2));

//     console.log('Wallet saved to file');
//   } catch (error: any) {
//     console.log('Error creating wallet:', error.message);
//   }
// }
async function checkExist() {
  const rs = await storage.getItem("wallet");
  // console.log(rs)
  if (rs && rs.address && rs.privateKey) {
    return true;
  }
  return false;
}

function printKaisarLogo(): void {
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

async function handleCommand(input: string): Promise<boolean> {
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
      const rs = await walletManager.createWallet();
      if (rs?.address && rs.privateKey) {
        console.log("Create new wallet success!");
        console.log("Address: ", rs.address);
        console.log("Private Key: ", rs.privateKey);
        console.log(
          "Please make sure to securely store your private key. You will need it to import your wallet in the future."
        );
        // const filePath = 'wallets.json';

        // let wallets: Wallet[] = [];
        // if (fs.existsSync(filePath)) {
        //   const data = fs.readFileSync(filePath);
        //   wallets = JSON.parse(data.toString());
        // }

        // wallets.push({ address: rs.address, privateKey: rs.privateKey });

        // fs.writeFileSync(filePath, JSON.stringify(wallets, null, 2));
        await storage.setItem("wallet", {
          address: rs.address,
          privateKey: btoa(rs.privateKey),
        });
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

      console.log("Please input private key to import wallet!");

      const privateKey = await new Promise<string>((resolve) => {
        rl.question("Private Key: ", (input) => {
          resolve(input);
        });
      });

      try {
        const rs = await walletManager.importWallet(privateKey);
        if (rs?.address && rs.privateKey) {
          console.log("Import wallet success!");
          console.log("Address: ", rs.address);
          await storage.setItem("wallet", {
            address: rs.address,
            privateKey: btoa(rs.privateKey),
          });
        } else {
          console.log("Import wallet failed!");
        }
      } catch (error) {
        console.log("Error importing wallet: ", error);
      }
      break;
    }

    case "3": {
      console.log("Register device!!");
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
          // console.clear();
          readline.cursorTo(process.stdout, 0, 0); // Di chuyển con trỏ về đầu dòng
          readline.clearScreenDown(process.stdout); // Xóa màn hình sau con trỏ
          // process.stdout.write('\x1Bc');
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

async function start(): Promise<void> {
  const networkId = await walletManager.isConnected();
  console.log(`Connected to network with ID: ${networkId}`);
  let count = 0;
  function askQuestion(): void {
    if (count % 2 === 0) printKaisarLogo();
    count++;
    rl.question("Enter your input command: ", async (input: string) => {
      if (input === "exit") {
        console.log("Exiting the program.");
        rl.close();
        return;
      }

      const rs = await handleCommand(input);
      if (!rs) {
        askQuestion();
      }
      // console.clear();q
    });
  }

  askQuestion();
}

start();
