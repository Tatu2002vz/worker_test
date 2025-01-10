/* eslint-disable import/no-extraneous-dependencies */
const Web3 = require("web3");
import Keyring from "@polkadot/keyring";
import { hexToU8a, stringToU8a, u8aToHex } from "@polkadot/util";
import * as peaqDidProtoJs from "peaq-did-proto-js";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import axios from "axios";
import { Sdk } from "@peaq-network/sdk";
import "dotenv/config";
const env = require("./env.json");

class WalletManager {
  private web3;

  private peaq_service_url = env.PEAQ_SERVICE_URL;

  private api_key = env.API_KEY;

  private project_api_key = env.PROJECT_API_KEY;

  private owner_seed = env.MNEMONIC as string;

  private did_subject_sedd = env.MNEMONIC as string;

  private depin_seed = env.MNEMONIC as string;

  constructor() {
    this.web3 = new Web3(env.HTTP_PROVIDER);
  }

  // Kiểm tra kết nối mạng
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
  createWallet() {
    try {
      const wallet = this.web3.eth.accounts.create();
      const { address, privateKey } = wallet;
      return { address, privateKey };
    } catch (error: any) {
      console.log("Error creating wallet:", error.message);
      return null;
    }
  }

  // Nhập ví từ private key
  importWallet(privateKey: string) {
    try {
      const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      const wallet = {
        privateKey,
        address: account.address,
      };
      return wallet;
    } catch (error: any) {
      console.log("Error importing wallet:", error.message);
      return null;
    }
  }

  async createEmailSignature(data: any) {
    try {
      const response = await axios.post(
        `${this.peaq_service_url}/v1/sign`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            APIKEY: this.api_key,
            "P-APIKEY": this.project_api_key,
          },
        }
      );

      // Note: You may need to adjust the response handling based on the service's response structure
      console.log(response.data);
      return response.data.data.signature;
    } catch (error: any) {
      console.error("Error creating email signature", error.response);
      throw error;
    }
  }

  async createDid(walletAddress: string, email: string) {
    await cryptoWaitReady();

    console.log("before use sdk 106!!");

    const keyring = new Keyring({ type: "sr25519" });
    // Creating key pair for the owner  of the subject  from seed
    const OwnerPair = keyring.addFromUri(this.owner_seed);
    console.log("keyring:: ", OwnerPair);
    // Creating key pair for the subject of the DID from seed
    const DIDSubjectPair = keyring.addFromUri(this.did_subject_sedd);
    // Creating key pair for the DePin from seed
    const DePinPair = keyring.addFromUri(this.depin_seed);
    console.log("before use sdk 114!!");

    // Address derived from DIDSubjectPair
    const DIDAddress = DIDSubjectPair.address;
    console.log(DIDAddress);
    // Signer Address derived from OwnerPair
    // const signerAddress = OwnerPair.address;

    // Email address signature will be  created and did address will be used to track the creator
    const postdata = {
      email,
      did_address: DIDAddress,
      tag: "TEST", // replace with your unique custom task tag
    };

    const emailSignature = await this.createEmailSignature(postdata); // Creating email  signature

    // Initializing SDK instance with DIDSubjectSeed

    // Generating signature using DePinSeed and DIDSubjectPair's address as data
    const signature = u8aToHex(DePinPair.sign(stringToU8a(DIDAddress)));

    try {
      console.log({
        address: walletAddress,
      });
      console.log("customDocumentFields", {
        services: [
          {
            id: "#emailSignature",
            type: "emailSignature",
            data: emailSignature,
          },
        ],
        signature: {
          type: "Ed25519VerificationKey2020",
          hash: signature,
          issuer: DePinPair.address, // The issuer is DePin
        },
      });
      console.log("before use sdk!!");
      const did = await Sdk.generateDidDocument({
        address: walletAddress,
        customDocumentFields: {
          services: [
            {
              id: "#emailSignature",
              type: "emailSignature",
              data: emailSignature,
            },
          ],
          signature: {
            type: "Ed25519VerificationKey2020",
            hash: signature,
            issuer: DePinPair.address,
          },
        },
      });
      console.log("after use sdk!!");

      const bytes = hexToU8a(did?.value as unknown as string);

      const document = peaqDidProtoJs.Document.deserializeBinary(bytes);
      console.log("document: ", document.toObject());
      return did;
    } catch (error) {
      console.error("DID Creation Error:", error);
      return null;
    }
  }
  async getBalnce(address: string) {
    const balance = await this.web3.eth.getBalance(address);
    return balance;
  }
}

export default WalletManager;
