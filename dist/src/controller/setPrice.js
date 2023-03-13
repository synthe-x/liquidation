"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrice = void 0;
const ethers_1 = require("ethers");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
require("dotenv").config();
// setPrice("0x04d3922c2b71FA9aB94b4e3A7fC00b42F8c9A63e", "2260000000")
async function setPrice(token, price) {
    try {
        const priceFeedAbi = JSON.parse((await fs_1.promises.readFile(path_1.default.join(__dirname + "../../abi/MockPriceFeed.json"))).toString())["abi"];
        let provider = new ethers_1.ethers.providers.JsonRpcProvider("https://nd-389-970-162.p2pify.com/17b0fbe8312c9ff963057d537b9c7864");
        let user1 = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY).connect(provider); //2
        const priceFeed = new ethers_1.ethers.Contract(token, priceFeedAbi, provider);
        // console.log(await priceFeed.price())
        console.log(await priceFeed.connect(user1).setPrice(price, 8));
    }
    catch (error) {
        console.log(`Error @ liquidate`, error);
    }
}
exports.setPrice = setPrice;
