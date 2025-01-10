"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-extraneous-dependencies */
var Web3 = require("web3");
var keyring_1 = require("@polkadot/keyring");
var util_1 = require("@polkadot/util");
var peaqDidProtoJs = require("peaq-did-proto-js");
var util_crypto_1 = require("@polkadot/util-crypto");
var axios_1 = require("axios");
var sdk_1 = require("@peaq-network/sdk");
require("dotenv/config");
var env = require("./env.json");
var WalletManager = /** @class */ (function () {
    function WalletManager() {
        this.peaq_service_url = env.PEAQ_SERVICE_URL;
        this.api_key = env.API_KEY;
        this.project_api_key = env.PROJECT_API_KEY;
        this.owner_seed = env.MNEMONIC;
        this.did_subject_sedd = env.MNEMONIC;
        this.depin_seed = env.MNEMONIC;
        this.web3 = new Web3(env.HTTP_PROVIDER);
    }
    // Kiểm tra kết nối mạng
    WalletManager.prototype.isConnected = function () {
        return __awaiter(this, void 0, void 0, function () {
            var networkId, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.web3.eth.net.getId()];
                    case 1:
                        networkId = _a.sent();
                        return [2 /*return*/, networkId];
                    case 2:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Tạo ví mới
    WalletManager.prototype.createWallet = function () {
        try {
            var wallet = this.web3.eth.accounts.create();
            var address = wallet.address, privateKey = wallet.privateKey;
            return { address: address, privateKey: privateKey };
        }
        catch (error) {
            console.log("Error creating wallet:", error.message);
            return null;
        }
    };
    // Nhập ví từ private key
    WalletManager.prototype.importWallet = function (privateKey) {
        try {
            var account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
            var wallet = {
                privateKey: privateKey,
                address: account.address,
            };
            return wallet;
        }
        catch (error) {
            console.log("Error importing wallet:", error.message);
            return null;
        }
    };
    WalletManager.prototype.createEmailSignature = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.post("".concat(this.peaq_service_url, "/v1/sign"), data, {
                                headers: {
                                    "Content-Type": "application/json",
                                    Accept: "application/json",
                                    APIKEY: this.api_key,
                                    "P-APIKEY": this.project_api_key,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        // Note: You may need to adjust the response handling based on the service's response structure
                        console.log(response.data);
                        return [2 /*return*/, response.data.data.signature];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error creating email signature", error_2.response);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WalletManager.prototype.createDid = function (walletAddress, email) {
        return __awaiter(this, void 0, void 0, function () {
            var keyring, OwnerPair, DIDSubjectPair, DePinPair, DIDAddress, postdata, emailSignature, signature, did, bytes, document_1, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, util_crypto_1.cryptoWaitReady)()];
                    case 1:
                        _a.sent();
                        console.log("before use sdk 106!!");
                        keyring = new keyring_1.default({ type: "sr25519" });
                        OwnerPair = keyring.addFromUri(this.owner_seed);
                        console.log("keyring:: ", OwnerPair);
                        DIDSubjectPair = keyring.addFromUri(this.did_subject_sedd);
                        DePinPair = keyring.addFromUri(this.depin_seed);
                        console.log("before use sdk 114!!");
                        DIDAddress = DIDSubjectPair.address;
                        console.log(DIDAddress);
                        postdata = {
                            email: email,
                            did_address: DIDAddress,
                            tag: "TEST", // replace with your unique custom task tag
                        };
                        return [4 /*yield*/, this.createEmailSignature(postdata)];
                    case 2:
                        emailSignature = _a.sent();
                        signature = (0, util_1.u8aToHex)(DePinPair.sign((0, util_1.stringToU8a)(DIDAddress)));
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
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
                        return [4 /*yield*/, sdk_1.Sdk.generateDidDocument({
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
                            })];
                    case 4:
                        did = _a.sent();
                        console.log("after use sdk!!");
                        bytes = (0, util_1.hexToU8a)(did === null || did === void 0 ? void 0 : did.value);
                        document_1 = peaqDidProtoJs.Document.deserializeBinary(bytes);
                        console.log("document: ", document_1.toObject());
                        return [2 /*return*/, did];
                    case 5:
                        error_3 = _a.sent();
                        console.error("DID Creation Error:", error_3);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    WalletManager.prototype.getBalnce = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.web3.eth.getBalance(address)];
                    case 1:
                        balance = _a.sent();
                        return [2 /*return*/, balance];
                }
            });
        });
    };
    return WalletManager;
}());
exports.default = WalletManager;
