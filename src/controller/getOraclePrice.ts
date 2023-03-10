import Big from "big.js";
import { ethers } from "ethers";
import { addressC, addressF, getAddress, getPricesC, getPricesF, provider } from "../util/constant";
import { getABI } from "../util/utils";


let setAllPrices: any = {}
// put all the addresses in lowerCase

export async function getPriceOracle(input: any, address: string) {
    try {
        const arrInput = Object.keys(input);
        const abi = await getABI("PriceOracle");
        const oracle = new ethers.Contract(address, abi, provider);
        const oracleRes = await oracle.getAssetsPrices(arrInput);
        for (let i in arrInput) {
            input[`${arrInput[i]}`][0] = Big(oracleRes[i]).div(1e8).toString();
            setAllPrices[arrInput[i]] = Big(oracleRes[i]).div(1e8).toString();
        }
    }
    catch (error) {
        console.log(`Error @ getPriceOracle`, error);
    }
}

export function getAllPrices(name: any) {
    return setAllPrices[getAddress[name]];
}

export function getPrices() {
    try {
        setInterval(() => {
            getPriceOracle(getPricesF, addressF);
            getPriceOracle(getPricesC, addressC);
        }, 10 * 1000)
    }
    catch (error) {
        console.log(`Error @ getPrices`, error);
    }
}