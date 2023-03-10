import Big from "big.js";
import { ethers } from "ethers";
import { poolCAddress, poolFAddress, provider } from "../util/constant";
import { getABI } from "../util/utils";


let setPoolDebtUSD: any = {}


async function _getPoolData(address: string) {
    try {
        const abi = await getABI("Pool");
        const pool = new ethers.Contract(address, abi, provider)
        const totalDebtUSD = await pool.getTotalDebtUSD();
        setPoolDebtUSD[`${address}`] = Big(totalDebtUSD).div(1e18).toString();
    }
    catch (error) {
        console.log(`Error @ _getPoolData`, error);
    }
}

export function getPoolData() {
    try{
        setInterval(()=>{
            _getPoolData(poolCAddress);
            _getPoolData(poolFAddress);
        }, 10 * 1000)
    }
    catch(error){
        console.log(`Error @ getPoolData`, error)
    }
}

export function getPoolDebtUSD(address: string){
    return setPoolDebtUSD[address];
}