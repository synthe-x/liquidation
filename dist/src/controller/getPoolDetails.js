"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolData = exports.startPoolData = void 0;
const big_js_1 = __importDefault(require("big.js"));
const ethers_1 = require("ethers");
const constant_1 = require("../util/constant");
const utils_1 = require("../util/utils");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
let poolData = {};
/**
 * @dev this function is use to get pool getTotalDebtUSD and totalSupply.
 * @param {*} poolAddress (string[]) array of string containing pool ids.
 */
async function _poolMulticall(poolAddress) {
    try {
        const multicall = new ethers_1.ethers.Contract("0x7a69be2c6827F45A6A4eE94b7D1Ed8484d17fcb8", await (0, utils_1.getABI)("Multicall2"), constant_1.provider);
        const itf = new ethers_1.ethers.utils.Interface(await (0, utils_1.getABI)("Pool"));
        const input = [];
        for (let ele of poolAddress) {
            input.push([ele, itf.encodeFunctionData("getTotalDebtUSD", [])]);
            input.push([ele, itf.encodeFunctionData("totalSupply", [])]);
        }
        let resp = await multicall.callStatic.aggregate(input);
        let outPut = [];
        for (let i = 0; i < poolAddress.length; i++) {
            outPut.push((0, big_js_1.default)(ethers_1.BigNumber.from(resp[1][i]).toString()).toString());
            poolData[poolAddress[i]] = [
                (0, big_js_1.default)(ethers_1.BigNumber.from(resp[1][2 * i]).toString()).div(1e18).toString(),
                (0, big_js_1.default)(ethers_1.BigNumber.from(resp[1][2 * i + 1]).toString()).toString()
            ];
        }
    }
    catch (error) {
        console.log(`Error @ poolMulticall`, error);
        return null;
    }
}
async function startPoolData() {
    try {
        const config = JSON.parse((await fs_1.promises.readFile(path_1.default.join(__dirname + "/../util/config.json"))).toString());
        setInterval(() => {
            const poolAddresses = Object.keys(config);
            _poolMulticall(poolAddresses);
        }, 10 * 1000);
    }
    catch (error) {
        console.log(`Error @ getPoolData`, error);
    }
}
exports.startPoolData = startPoolData;
function getPoolData(poolId) {
    try {
        return poolData[poolId];
    }
    catch (error) {
        console.log(`Error @ getPoolData`);
    }
}
exports.getPoolData = getPoolData;
