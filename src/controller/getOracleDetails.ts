import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import { provider } from "../util/constant";
import { getABI } from "../util/utils";
import { promises as fs } from "fs";
import path from "path";




/**
 * @dev this function is use to get pool getTotalDebtUSD and totalSupply.
 * @param {*} poolAddress (string[]) array of string containing pool ids.
 */
async function _oracleMulticall(input: any) {
    try {

        const multicall = new ethers.Contract(
            "0x7a69be2c6827F45A6A4eE94b7D1Ed8484d17fcb8",
            await getABI("Multicall2"),
            provider
        );

        const itf: ethers.utils.Interface = new ethers.utils.Interface(await getABI("PriceOracle"));

        const mInput: any = [];

        for (let i in input) {
            let coll = Object.keys(input[i][0]);
            mInput.push([input[i][1], itf.encodeFunctionData("getAssetsPrices", [coll])]);
        }

        let resp = await multicall.callStatic.aggregate(
            mInput
        );


        for (let i = 0; i < resp[1].length; i++) {

            let prices = itf.decodeFunctionResult("getAssetsPrices", resp[1][i])[0];

            for (let j = 0; j < prices.length; j++) {
                let coll = Object.keys(input[i][0]);
                input[i][0][`${coll[j]}`][0] = Big(prices[j]).div(1e8).toString();
            }
        }

        return input

    }
    catch (error) {
        console.log(`Error @ poolMulticall`, error)
        return null
    }
}

export async function startOracleData() {
    try {
        const config = JSON.parse((await fs.readFile(path.join(__dirname + "/../util/config.json"))).toString());
        setInterval(async () => {

            const poolAddresses = Object.keys(config);

            const input: any = []
            for (let i in poolAddresses) {
                input.push([config[poolAddresses[i]]["collaterals"], config[poolAddresses[i]]["oracle"]])
            }

            let outPut = await _oracleMulticall(input);

            for (let i = 0; i < outPut.length; i++) {
                config[poolAddresses[i]]["collaterals"] = outPut[i][0]
            }

            await fs.writeFile(path.join(__dirname + "/../util/config.json"), JSON.stringify(config));

        }, 10 * 1000)
        let wait = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve("success")
            }, 10 * 1000)
        });
        await wait;
    }
    catch (error) {
        console.log(`Error @ getPoolData`, error);
    }
}

export async function getAllPrices(poolId: string, collateralId: string) {
    let config = JSON.parse((await (fs.readFile(path.join(__dirname + "/../util/config.json")))).toString());
    return config[poolId]["collaterals"][collateralId][0]
};
