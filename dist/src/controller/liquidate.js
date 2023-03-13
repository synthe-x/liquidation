"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.liquidate = void 0;
const ethers_1 = require("ethers");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
require("dotenv").config();
async function liquidate(userId, amount, collateralId, synthId) {
    try {
        const getLiquidateAbi = JSON.parse((await fs_1.promises.readFile(path_1.default.join(__dirname + "../../abi/ERC20X.json"))).toString())["abi"];
        let provider = new ethers_1.ethers.providers.JsonRpcProvider("https://nd-389-970-162.p2pify.com/17b0fbe8312c9ff963057d537b9c7864");
        let user1 = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY1).connect(provider);
        console.log("Inside liquidation============================================");
        const synth = new ethers_1.ethers.Contract(synthId, getLiquidateAbi, provider);
        amount = ethers_1.ethers.utils.parseEther(amount).toString();
        console.log(userId, amount, collateralId, synthId);
        const liq = await synth.connect(user1).liquidate(userId, amount, collateralId);
        console.log(liq);
    }
    catch (error) {
        console.log(`Error @ liquidate`, error);
    }
}
exports.liquidate = liquidate;
