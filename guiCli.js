"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
/* eslint-disable func-names */
// import Web3 from 'web3';
var readline = require("readline");
var storage = require("node-persist");
var walletManager_1 = require("./walletManager");
var axios = require("axios");
var env = require("./env.json");
var walletManager = new walletManager_1.default();
storage.initSync({ dir: "./data" });
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
});
function checkExist() {
    return __awaiter(this, void 0, void 0, function () {
        var rs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, storage.getItem("wallet")];
                case 1:
                    rs = _a.sent();
                    // console.log(rs)
                    if (rs && rs.address && rs.privateKey) {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
            }
        });
    });
}
function printKaisarLogo() {
    console.log("**********************************************************************************************");
    console.log("                                                                           ");
    console.log("oooo    oooo         .o.         ooooo    .oooooo..o        .o.          ooooooooo.   ");
    console.log("`888   .8P'         .888.        `888'   d8P'    `Y8       .888.        `888   `Y88. ");
    console.log(" 888  d8'          .8\"888.        888    Y88bo.           .8\"888.        888   .d88' ");
    console.log(" 88888[           .8' `888.       888     `\"Y8888o.      .8' `888.       888ooo88P'  ");
    console.log(' 888`88b.        .88ooo8888.      888         `"Y88b    .88ooo8888.      888`88b.    ');
    console.log(" 888  `88b.     .8'     `888.     888    oo     .d8P   .8'     `888.     888  `88b.  ");
    console.log('o888o  o888o   o88o     o8888o   o888o   8""88888P\'   o88o     o8888o    o888o  o888o ');
    console.log("                                                                           ");
    console.log("**********************************************************************************************");
    console.log("Welcome to Kaisar Wallet CLI!! ");
    console.log("1. Create a new wallet");
    console.log("2. Import existing wallet");
    console.log("3. Register device");
    console.log("4. Check status");
    console.log("**********************************************************************************************");
}
function validateEmail(email) {
    var regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email);
}
function handleCommand(input) {
    return __awaiter(this, void 0, void 0, function () {
        var parts, command, intervalFlag, _a, exist, rs, exist, privateKey, rs, error_1, exploerAPI, email, testEmail, wallet, dataPost, rs, error_2, wallet, address, email, peaqDID, resource, systemStatus, dockerStatus, data, intervalId;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    parts = input.split(" ");
                    command = parts[0];
                    intervalFlag = false;
                    _a = command;
                    switch (_a) {
                        case "1": return [3 /*break*/, 1];
                        case "2": return [3 /*break*/, 7];
                        case "3": return [3 /*break*/, 17];
                        case "4": return [3 /*break*/, 28];
                        case "5": return [3 /*break*/, 35];
                    }
                    return [3 /*break*/, 36];
                case 1: return [4 /*yield*/, checkExist()];
                case 2:
                    exist = _b.sent();
                    if (exist) {
                        console.log("A wallet already exists. Please proceed with a different option.");
                        return [3 /*break*/, 37];
                    }
                    return [4 /*yield*/, walletManager.createWallet()];
                case 3:
                    rs = _b.sent();
                    if (!((rs === null || rs === void 0 ? void 0 : rs.address) && rs.privateKey)) return [3 /*break*/, 5];
                    console.log("Create new wallet success!");
                    console.log("Address: ", rs.address);
                    console.log("Private Key: ", rs.privateKey);
                    console.log("Please make sure to securely store your private key. You will need it to import your wallet in the future.");
                    return [4 /*yield*/, storage.setItem("wallet", {
                            address: rs.address,
                            privateKey: btoa(rs.privateKey),
                        })];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    console.log("Create new wallet failed!");
                    _b.label = 6;
                case 6: return [3 /*break*/, 37];
                case 7: return [4 /*yield*/, checkExist()];
                case 8:
                    exist = _b.sent();
                    if (exist) {
                        console.log("A wallet already exists. Please proceed with a different option.");
                        return [3 /*break*/, 37];
                    }
                    console.log("Please input private key to import wallet!");
                    return [4 /*yield*/, new Promise(function (resolve) {
                            rl.question("Private Key: ", function (input) {
                                resolve(input);
                            });
                        })];
                case 9:
                    privateKey = _b.sent();
                    _b.label = 10;
                case 10:
                    _b.trys.push([10, 15, , 16]);
                    return [4 /*yield*/, walletManager.importWallet(privateKey)];
                case 11:
                    rs = _b.sent();
                    if (!((rs === null || rs === void 0 ? void 0 : rs.address) && rs.privateKey)) return [3 /*break*/, 13];
                    console.log("Import wallet success!");
                    console.log("Address: ", rs.address);
                    return [4 /*yield*/, storage.setItem("wallet", {
                            address: rs.address,
                            privateKey: btoa(rs.privateKey),
                        })];
                case 12:
                    _b.sent();
                    return [3 /*break*/, 14];
                case 13:
                    console.log("Import wallet failed!");
                    _b.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_1 = _b.sent();
                    console.log("Error importing wallet: ", error_1);
                    return [3 /*break*/, 16];
                case 16: return [3 /*break*/, 37];
                case 17:
                    _b.trys.push([17, 26, , 27]);
                    exploerAPI = env.EXPLOER_API;
                    return [4 /*yield*/, storage.getItem("email")];
                case 18:
                    email = _b.sent();
                    if (!email) return [3 /*break*/, 19];
                    console.log("Your email is: ", email);
                    return [3 /*break*/, 21];
                case 19:
                    console.log("Please enter your email to continue.");
                    return [4 /*yield*/, new Promise(function (resolve) {
                            rl.question("Email: ", function (input) {
                                resolve(input);
                            });
                        })];
                case 20:
                    email = _b.sent();
                    _b.label = 21;
                case 21:
                    testEmail = validateEmail(email);
                    if (!!testEmail) return [3 /*break*/, 22];
                    console.log("Please enter a valid email address.");
                    return [3 /*break*/, 25];
                case 22: return [4 /*yield*/, storage.getItem("wallet")];
                case 23:
                    wallet = _b.sent();
                    dataPost = {
                        email: email,
                        address: wallet.address,
                        tag: "kaisar_worker",
                    };
                    return [4 /*yield*/, axios.post(exploerAPI, dataPost, {
                            headers: {
                                "x-api-key": env.X_API_KEY,
                            },
                        })];
                case 24:
                    rs = _b.sent();
                    console.log("result: ", rs);
                    _b.label = 25;
                case 25: return [3 /*break*/, 27];
                case 26:
                    error_2 = _b.sent();
                    console.log("Error when register device! ", error_2);
                    return [3 /*break*/, 27];
                case 27: return [3 /*break*/, 37];
                case 28: return [4 /*yield*/, storage.getItem("wallet")];
                case 29:
                    wallet = _b.sent();
                    address = wallet.address;
                    console.log("Address: ", address);
                    return [4 /*yield*/, storage.getItem("email")];
                case 30:
                    email = _b.sent();
                    console.log("Email: ", email);
                    return [4 /*yield*/, storage.getItem("PeaqDID")];
                case 31:
                    peaqDID = _b.sent();
                    console.log("Peaq DID: ", peaqDID);
                    return [4 /*yield*/, storage.getItem("resource")];
                case 32:
                    resource = _b.sent();
                    return [4 /*yield*/, storage.getItem("system-status")];
                case 33:
                    systemStatus = _b.sent();
                    return [4 /*yield*/, storage.getItem("docker")];
                case 34:
                    dockerStatus = _b.sent();
                    data = __assign(__assign(__assign({}, resource), systemStatus), dockerStatus);
                    console.log("Spect: ", data);
                    return [3 /*break*/, 37];
                case 35:
                    {
                        intervalFlag = true;
                        intervalId = void 0;
                        if (!intervalId) {
                            setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                var resource, systemStatus;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            // console.clear();
                                            readline.cursorTo(process.stdout, 0, 0); // Di chuyển con trỏ về đầu dòng
                                            readline.clearScreenDown(process.stdout); // Xóa màn hình sau con trỏ
                                            return [4 /*yield*/, storage.getItem("resource")];
                                        case 1:
                                            resource = _a.sent();
                                            console.log("Resource: ", resource);
                                            return [4 /*yield*/, storage.getItem("system-status")];
                                        case 2:
                                            systemStatus = _a.sent();
                                            console.log("System status: ", systemStatus);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, 2000);
                        }
                        return [3 /*break*/, 37];
                    }
                    _b.label = 36;
                case 36:
                    console.log("Unknown sub-command: ".concat(command));
                    return [3 /*break*/, 37];
                case 37: return [2 /*return*/, intervalFlag];
            }
        });
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function () {
        function askQuestion() {
            var _this = this;
            if (count % 2 === 0)
                printKaisarLogo();
            count++;
            rl.question("Enter your input command: ", function (input) { return __awaiter(_this, void 0, void 0, function () {
                var rs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (input === "exit") {
                                console.log("Exiting the program.");
                                rl.close();
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, handleCommand(input)];
                        case 1:
                            rs = _a.sent();
                            if (!rs) {
                                askQuestion();
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        var networkId, count;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, walletManager.isConnected()];
                case 1:
                    networkId = _a.sent();
                    console.log("Connected to network with ID: ".concat(networkId));
                    count = 0;
                    askQuestion();
                    return [2 /*return*/];
            }
        });
    });
}
start();
