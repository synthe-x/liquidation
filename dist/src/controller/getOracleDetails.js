"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPrices = exports.startOracleData = void 0;
const big_js_1 = __importDefault(require("big.js"));
const ethers_1 = require("ethers");
const constant_1 = require("../util/constant");
const utils_1 = require("../util/utils");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * @dev this function is use to get pool getTotalDebtUSD and totalSupply.
 * @param {*} poolAddress (string[]) array of string containing pool ids.
 */
async function _oracleMulticall(input) {
    try {
        const multicall = new ethers_1.ethers.Contract("0x7a69be2c6827F45A6A4eE94b7D1Ed8484d17fcb8", await (0, utils_1.getABI)("Multicall2"), constant_1.provider);
        const itf = new ethers_1.ethers.utils.Interface(await (0, utils_1.getABI)("PriceOracle"));
        const mInput = [];
        for (let i in input) {
            let coll = Object.keys(input[i][0]);
            mInput.push([input[i][1], itf.encodeFunctionData("getAssetsPrices", [coll])]);
        }
        let resp = await multicall.callStatic.aggregate(mInput);
        for (let i = 0; i < resp[1].length; i++) {
            let prices = itf.decodeFunctionResult("getAssetsPrices", resp[1][i])[0];
            for (let j = 0; j < prices.length; j++) {
                let coll = Object.keys(input[i][0]);
                input[i][0][`${coll[j]}`][0] = (0, big_js_1.default)(prices[j]).div(1e8).toString();
            }
        }
        return input;
    }
    catch (error) {
        console.log(`Error @ poolMulticall`, error);
        return null;
    }
}
async function startOracleData() {
    try {
        const config = JSON.parse((await fs_1.promises.readFile(path_1.default.join(__dirname + "/../util/config.json"))).toString());
        setInterval(async () => {
            const poolAddresses = Object.keys(config);
            const input = [];
            for (let i in poolAddresses) {
                input.push([config[poolAddresses[i]]["collaterals"], config[poolAddresses[i]]["oracle"]]);
            }
            let outPut = await _oracleMulticall(input);
            for (let i = 0; i < outPut.length; i++) {
                config[poolAddresses[i]]["collaterals"] = outPut[i][0];
            }
            await fs_1.promises.writeFile(path_1.default.join(__dirname + "/../util/config.json"), JSON.stringify(config));
        }, 10 * 1000);
    }
    catch (error) {
        console.log(`Error @ getPoolData`, error);
    }
}
exports.startOracleData = startOracleData;
async function getAllPrices(poolId, collateralId) {
    let config = JSON.parse((await (fs_1.promises.readFile(path_1.default.join(__dirname + "/../util/config.json")))).toString());
    return config[poolId]["collaterals"][collateralId][0];
}
exports.getAllPrices = getAllPrices;
;
