import axios from "axios";
import Big from "big.js";
import { connectToDB, LiqMonitor } from "../db/db";
import { getAddress } from "../util/constant";
import { getAllPrices } from "./getOraclePrice";
import { getPoolDebtUSD } from "./getPoolDetails";
import { liquidate } from "./liquidate";


export function startGetPosition() {
    getPosition()
    setInterval(() => {
        getPosition()
    }, 1 * 60 * 1000)
}

async function getPosition() {
    try {

        let _skip = 0;
        while (true) {
            let data = await axios({

                method: "post",
                url: `https://api.thegraph.com/subgraphs/name/prasad-kumkar/synthex`,
                data:
                {
                    query: `
                {
                    accounts (first: 100, skip: ${_skip * 100}){
                      id
                      positions {
                        pool {
                          id
                          totalDebtUSD
                          totalSupply
                          feeToken{
                            priceUSD
                            id
                          }
                        }
                        balance
                        collateralBalances {
                          collateral{
                            token{
                              name
                              id
                              symbol
                            }
                            priceUSD
                            liqThreshold
                            baseLTV
                          }
                          balance
                        }
                      }
                    }
                  }`
                }
            })

            let accounts = data.data.data.accounts;
            if (accounts.length == 0) {
                console.log("break")
                break
            }

            _skip++
            // await Promise.all([])
            for (let ele of accounts) {
                let userId = ele.id;
                console.log(userId)
                for (let pEle of ele.positions) {

                    let pool = pEle.pool;
                    let supply = pool.totalSupply;
                    let debt = pool.totalDebtUSD;    // without decimals
                    let poolDebt = getPoolDebtUSD(pool.id);
                    if(poolDebt) {
                        debt = poolDebt
                    }
                    let balance = pEle.balance
                    let feeTokenPrice = pool.feeToken.priceUSD;
                    let price = getAllPrices('cUSDC'); // cUSDC address
                    let feeTokenId = pool.feeToken.id;
                    if (price && feeTokenId == getAddress["cUSDC"]) {
                        feeTokenPrice = price
                    }
                    let debtPerc = Big(balance).div(supply).toString();
                    let userDebtUSD = Big(debtPerc).mul(debt).toString();
                    console.log("Usd debt", Number(userDebtUSD).toFixed(8));
                    let userTotalColUSD = "0";
                    let colLiqFactors: number[][] = [];  // collateral liquidity factors ["baseLtv", liqThreshold]

                    for (let cEle of pEle.collateralBalances) {
                        colLiqFactors.push([cEle.collateral.baseLTV, cEle.collateral.liqThreshold]);
                        let colPrice = cEle.collateral.priceUSD;             // without decimalsget
                        let price = getAllPrices(cEle.collateral.token.symbol);
                        if (price) {
                            colPrice = price;
                        }
                        let colUSD = Big(cEle.balance).div(1e18).mul(colPrice).toString();   // converting balance to without decimals
                        userTotalColUSD = Big(userTotalColUSD).plus(colUSD).toString();

                    }
                    console.log("collateral balance", Number(userTotalColUSD).toFixed(8));

                    let userHealthFactor = Big(userDebtUSD).div(userTotalColUSD).toFixed(4);

                    console.log("health", userHealthFactor);

                    for (let i in colLiqFactors) {

                        let avgFactor = Big(colLiqFactors[i][0]).plus(colLiqFactors[i][1]).div(2e4).toString();
                        let colId = pEle.collateralBalances[i].collateral.token.id;
                        let liquidationAmount = Big(userDebtUSD).mul(1.1).mul(feeTokenPrice).toFixed(18);  // increasing the price by 10% for safer side

                        if (Number(colLiqFactors[i][1] / 1e4) < Number(userHealthFactor)) {
                            // call liquidate function
                            let allIds = await LiqMonitor.findOne().lean();
                            liquidate(userId, liquidationAmount, colId, feeTokenId);
                            if (allIds?.ids[userId]) {
                                delete allIds?.ids[userId]

                                await LiqMonitor.findOneAndUpdate(
                                    {},
                                    { $set: { ids: allIds?.ids } }
                                )
                            }

                        }

                        else if (Number(avgFactor) < Number(userHealthFactor)) {
                            // send ids on watching list;
                            let allIds = await LiqMonitor.findOne().lean();
                            let ids: any = {};
                            if (allIds && allIds.ids) {
                                ids = allIds.ids
                            }

                            let temp: any = {}
                            temp["ids"] = ids;
                            temp["ids"][`${userId}`] = '0';
                            await LiqMonitor.findOneAndUpdate(
                                {},
                                { $set: temp },
                                { upsert: true }
                            )
                        }
                    }
                }
            }
        }

    }
    catch (error) {
        console.log(`Error @ getPosition`, error)
    }
}

