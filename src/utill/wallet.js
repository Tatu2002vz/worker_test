const Web3 = require("web3");
const { AbiCoder, ethers } = require("ethers");
const env = require("../../env.json");
const { DID_ABI } = require("../abi/ABI");
class walletManager {
  constructor() {
    this.web3 = new Web3(env.HTTP_PROVIDER);
    this.didContract = new this.web3.eth.Contract(DID_ABI, env.DID_ADDRESS);
  }

  // Kết nối tới WebSocket server với xác thực JWT
  async isConnected() {
    try {
      const networkId = await this.web3.eth.net.getId();
      return networkId;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // Tạo ví mới
  createWallet(password) {
    try {
      const wallet = this.web3.eth.accounts.create();
      const { address, privateKey } = wallet;
      const encryptKeyStore = this.web3.eth.accounts.encrypt(
        privateKey,
        password
      );
      return { address, privateKey, encryptKeyStore };
    } catch (error) {
      console.log("Error creating wallet:", error?.message);
      return null;
    }
  }

  // Nhập ví từ private key
  importWallet(privateKey, password) {
    try {
      const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      const encryptKeyStore = this.web3.eth.accounts.encrypt(
        privateKey,
        password
      );

      const wallet = {
        privateKey,
        address: account.address,
        encryptKeyStore,
      };
      return wallet;
    } catch (error) {
      console.log("Error importing wallet:", error.message);
      return null;
    }
  }

  async exportPrivateKey(encryptKeyStore, password) {
    try {
      const account = this.web3.eth.accounts.decrypt(
        { ...encryptKeyStore },
        password
      );
      return account.privateKey;
    } catch (error) {}
  }

  async getBalnce(address) {
    const balance = await this.web3.eth.getBalance(address);
    return balance;
  }
  async addAttribute({ address, privateKey }, { name, value }, nonce = 0) {
    const data = this.didContract.methods
      .addAttribute(address, name, value, nonce)
      .encodeABI();
    const tx = {
      from: address,
      to: env.DID_ADDRESS,
      data: data,
      gas: await this.web3.eth.estimateGas({
        from: address,
        to: env.DID_ADDRESS,
        data: data,
      }),
    };
    const signTx = await this.web3.eth.accounts.signTransaction(tx, privateKey);
    // Call API exploer send signTx
    //-----------------
    return signTx;
  }
  // ---------------
  generateEoaSignature(eoaAccount, target, data, nonce) {
    const eoaMessageHash = ethers.solidityPackedKeccak256(
      ["address", "address", "bytes", "uint256"],
      [eoaAccount.address, target, data, nonce]
    );

    const signature = eoaAccount.sign(eoaMessageHash).signature;

    return signature;
  }
  async peaqStorage(spec, privateKey, nonce = 1) {
    const account = await this.web3.eth.privateKeyToAccount(privateKey);
    const target = env.DID_ADDRESS;
    const abiCoder = new AbiCoder();
    const addItemFunctionSignature = "addItem(bytes,bytes)";
    const addItemFunctionSelector = ethers
      .keccak256(ethers.toUtf8Bytes(addItemFunctionSignature))
      .substring(0, 10);

    const now = new Date().getTime();

    const itemType = "kaisar_worker-" + now;
    const itemTypeHex = ethers.hexlify(ethers.toUtf8Bytes(itemType));
    const item = spec; // spec là chuỗi json cấu hình cpu, ram, storage, os của máy
    const itemHex = ethers.hexlify(ethers.toUtf8Bytes(item));

    const params = abiCoder.encode(["bytes", "bytes"], [itemTypeHex, itemHex]);

    const calldata = params.replace("0x", addItemFunctionSelector);

    const eoaSignature = generateEoaSignature(account, target, calldata, nonce);
  }
}

module.exports = walletManager;
