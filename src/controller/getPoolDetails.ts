import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import { provider } from "../util/constant";
import { getABI } from "../util/utils";
import { promises as fs } from "fs";
import path from "path";


let poolData: any = {}

/**
 * @dev this function is use to get pool getTotalDebtUSD and totalSupply.
 * @param {*} poolAddress (string[]) array of string containing pool ids.
 */
async function _poolMulticall(poolAddress: string[]) {
    try {

        const multicall = new ethers.Contract(
            "0x7a69be2c6827F45A6A4eE94b7D1Ed8484d17fcb8",
            await getABI("Multicall2"),
            provider
        );

        const itf: ethers.utils.Interface = new ethers.utils.Interface(await getABI("Pool"));
        const input: any = [];
        for (let ele of poolAddress) {
            input.push([ele, itf.encodeFunctionData("getTotalDebtUSD", [])]);
            input.push([ele, itf.encodeFunctionData("totalSupply", [])]);
        }
        let resp = await multicall.callStatic.aggregate(
            input
        );

        let outPut: string[] = [];

        for (let i = 0; i < poolAddress.length; i++) {
            outPut.push(Big(BigNumber.from(resp[1][i]).toString()).toString());
            poolData[poolAddress[i]] = [
                Big(BigNumber.from(resp[1][2 * i]).toString()).div(1e18).toString(),
                Big(BigNumber.from(resp[1][2 * i + 1]).toString()).toString()
            ]
        }

    }
    catch (error) {
        console.log(`Error @ poolMulticall`, error)
        return null
    }
}

export async function startPoolData() {
    try {
        const config = JSON.parse((await fs.readFile(path.join(__dirname + "/../util/config.json"))).toString());
        setInterval(() => {
            const poolAddresses = Object.keys(config);
            _poolMulticall(poolAddresses);
        }, 10 * 1000)

    }
    catch (error) {
        console.log(`Error @ getPoolData`, error);
    }
}

export function getPoolData(poolId: string) {
    try {
        return poolData[poolId];
    }
    catch (error) {
        console.log(`Error @ getPoolData`)
    }
}