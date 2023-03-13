import axios from "axios";
import Big from "big.js";
import { LiqMonitor } from "../db/db";
import { getAllPrices } from "./getOracleDetails";
import { getPoolData } from "./getPoolDetails";
import { liquidate } from "./liquidate";



export function watch() {
    setInterval(() => {
        watchForLiquidation()
    }, 1000 * 10)
}



async function watchForLiquidation() {
    try {

        let getIds = await LiqMonitor.findOne().lean();

        if (!getIds || Object.keys(getIds?.ids).length == 0) {
            // console.log("Nothing to watch")
            return
        }

        let start = 0;
        let end = 50;
        while (true) {

            let allIds = Object.keys(getIds?.ids);
            let input: any = JSON.stringify(allIds.slice(start, end));

            if (allIds.slice(start, end).length == 0) {
                // console.log("Done Watching")
                return
            }

            let data = await axios({

                method: "post",
                url: `https://api.thegraph.com/subgraphs/name/prasad-kumkar/synthex-dev`,
                data:
                {
                    query: `
                    {
                        accounts(where: { id_in: ${input}}) {
                            id
                            positions {
                                    pool {
                                    id
                                    feeToken{
                                        id
                                    }
                                    }
                                    balance
                                    collateralBalances {
                                    collateral{
                                        token{
                                        id
                                        }
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
            // console.log("Inside Watching");
            for (let ele of accounts) {
                let userId: string = ele.id;
                console.log(userId);
                let flag = false;
                for (let pEle of ele.positions) {

                    let pool = pEle.pool;
                    let poolData = getPoolData(pool.id);
                    let debt = poolData[0];   //pool.totalDebtUSD;    
                    let supply = poolData[1];  //pool.totalSupply;
                    let balance = pEle.balance
                    let feeTokenId = pool.feeToken.id;
                    let feeTokenPrice = await getAllPrices(pool.id, feeTokenId);      //pool.feeToken.priceUSD;
                    let debtPerc = Big(balance).div(supply).toString();
                    let userDebtUSD = Big(debtPerc).mul(debt).toString();
                    console.log("Usd debt", Number(userDebtUSD).toFixed(8));
                    let userTotalColUSD = "0";
                    let colLiqFactors: number[][] = [];  // collateral liquidity factors ["baseLtv", liqThreshold]

                    for (let cEle of pEle.collateralBalances) {

                        colLiqFactors.push([cEle.collateral.baseLTV, cEle.collateral.liqThreshold]);
                        let colPrice = await getAllPrices(pool.id, cEle.collateral.token.id);
                        let colUSD = Big(cEle.balance).div(1e18).mul(colPrice).toString();   // converting balance to without decimals
                        userTotalColUSD = Big(userTotalColUSD).plus(colUSD).toString();
                    }
                    console.log("collateral balance", Number(userTotalColUSD).toFixed(8));

                    let userHealthFactor = Big(userDebtUSD).div(userTotalColUSD).toFixed(4);
                    console.log("Health Factor", userHealthFactor);

                    for (let i in colLiqFactors) {
                        let avgFactor = Big(colLiqFactors[i][0]).plus(colLiqFactors[i][1]).div(2e4).toString();  // avg of LTV and liqThreshold.
                        let colId: string = pEle.collateralBalances[i].collateral.token.id;
                        let liquidationAmount: string = Big(userDebtUSD).mul(1.1).mul(feeTokenPrice).toFixed(18);  // increasing the price by 10% for safer side 
                        
                        console.log(`avg:${avgFactor}, user: ${userHealthFactor}, liq ${colLiqFactors[i][1] / 1e4}`);

                        if (Number(colLiqFactors[i][1] / 1e4) < Number(userHealthFactor)) {
                            // call liquidate function
                            liquidate(userId, liquidationAmount, colId, feeTokenId);
                            delete getIds?.ids[userId]

                            await LiqMonitor.findOneAndUpdate(
                                {},
                                { $set: { ids: getIds?.ids } }
                            )
                        }
                        if (Number(avgFactor) < Number(userHealthFactor)) { flag = true; }
                    }
                }
                if (flag == false) {
                    console.log("delete id watch")
                    delete getIds?.ids[userId];
                    await LiqMonitor.findOneAndUpdate(
                        {},
                        { $set: { ids: getIds?.ids } }
                    )
                }
            }
            start = end;
            end = end + 50;
        }


    }
    catch (error) {
        console.log(`Error @ getPosition`, error)
    }
}
