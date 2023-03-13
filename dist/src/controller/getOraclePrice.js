"use strict";
// import Big from "big.js";
// import { ethers } from "ethers";
// import {  oracleAddress, provider } from "../util/constant";
// import { getABI } from "../util/utils";
// import { promises as fs } from "fs";
// import path from "path";
// let setAllPrices: any = {}
// // put all the addresses in lowerCase
// export async function getPriceOracle(input: any, address: string) {
//     try {
//         const arrInput = Object.keys(input);
//         const abi = await getABI("PriceOracle");
//         const oracle = new ethers.Contract(address, abi, provider);
//         const oracleRes = await oracle.getAssetsPrices(arrInput);
//         for (let i in arrInput) {
//             input[`${arrInput[i]}`][0] = Big(oracleRes[i]).div(1e8).toString();
//         }
//         return input;
//     }
//     catch (error) {
//         console.log(`Error @ getPriceOracle`, error);
//     }
// }
// export async function getAllPrices(poolId: string, collateralId: string) {
//     let config = JSON.parse((await (fs.readFile(path.join(__dirname + "/../util/config.json")))).toString());
//     return config[poolId]["collaterals"][collateralId][0]
// }
// // export async function getFeeTokenPrice(poolId: string) {
// //     let config = JSON.parse((await (fs.readFile(path.join(__dirname + "/../util/config.json")))).toString());
// //     return config[poolId]
// // }
// export async function getPrices() {
//     try {
//         let config = JSON.parse((await (fs.readFile(path.join(__dirname + "/../util/config.json")))).toString());
//         setInterval(async () => {
//             let pools = Object.keys(config);
//             for (let i in pools) {
//                 const address = oracleAddress[pools[i]];
//                 let updatePrice = await getPriceOracle(config[pools[i]]["collaterals"], address);
//                 config[pools[i]]["collaterals"] = updatePrice;
//                 await fs.writeFile(path.join(__dirname + "/../util/config.json"), JSON.stringify(config));
//             }
//         }, 10 * 1000)
//     }
//     catch (error) {
//         console.log(`Error @ getPrices`, error);
//     }
// }
