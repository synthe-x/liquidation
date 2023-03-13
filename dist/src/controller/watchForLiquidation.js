"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = void 0;
const axios_1 = __importDefault(require("axios"));
const big_js_1 = __importDefault(require("big.js"));
const db_1 = require("../db/db");
const getOracleDetails_1 = require("./getOracleDetails");
const getPoolDetails_1 = require("./getPoolDetails");
const liquidate_1 = require("./liquidate");
function watch() {
    setInterval(() => {
        watchForLiquidation();
    }, 1000 * 10);
}
exports.watch = watch;
async function watchForLiquidation() {
    try {
        let getIds = await db_1.LiqMonitor.findOne().lean();
        if (!getIds || Object.keys(getIds?.ids).length == 0) {
            // console.log("Nothing to watch")
            return;
        }
        let start = 0;
        let end = 50;
        while (true) {
            let allIds = Object.keys(getIds?.ids);
            let input = JSON.stringify(allIds.slice(start, end));
            if (allIds.slice(start, end).length == 0) {
                // console.log("Done Watching")
                return;
            }
            let data = await (0, axios_1.default)({
                method: "post",
                url: `https://api.thegraph.com/subgraphs/name/prasad-kumkar/synthex-dev`,
                data: {
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
            });
            let accounts = data.data.data.accounts;
            // console.log("Inside Watching");
            for (let ele of accounts) {
                let userId = ele.id;
                console.log(userId);
                let flag = false;
                for (let pEle of ele.positions) {
                    let pool = pEle.pool;
                    let poolData = (0, getPoolDetails_1.getPoolData)(pool.id);
                    let debt = poolData[0]; //pool.totalDebtUSD;    
                    let supply = poolData[1]; //pool.totalSupply;
                    let balance = pEle.balance;
                    let feeTokenId = pool.feeToken.id;
                    let feeTokenPrice = await (0, getOracleDetails_1.getAllPrices)(pool.id, feeTokenId); //pool.feeToken.priceUSD;
                    let debtPerc = (0, big_js_1.default)(balance).div(supply).toString();
                    let userDebtUSD = (0, big_js_1.default)(debtPerc).mul(debt).toString();
                    console.log("Usd debt", Number(userDebtUSD).toFixed(8));
                    let userTotalColUSD = "0";
                    let colLiqFactors = []; // collateral liquidity factors ["baseLtv", liqThreshold]
                    for (let cEle of pEle.collateralBalances) {
                        colLiqFactors.push([cEle.collateral.baseLTV, cEle.collateral.liqThreshold]);
                        let colPrice = await (0, getOracleDetails_1.getAllPrices)(pool.id, cEle.collateral.token.id);
                        let colUSD = (0, big_js_1.default)(cEle.balance).div(1e18).mul(colPrice).toString(); // converting balance to without decimals
                        userTotalColUSD = (0, big_js_1.default)(userTotalColUSD).plus(colUSD).toString();
                    }
                    console.log("collateral balance", Number(userTotalColUSD).toFixed(8));
                    let userHealthFactor = (0, big_js_1.default)(userDebtUSD).div(userTotalColUSD).toFixed(4);
                    console.log("Health Factor", userHealthFactor);
                    for (let i in colLiqFactors) {
                        let avgFactor = (0, big_js_1.default)(colLiqFactors[i][0]).plus(colLiqFactors[i][1]).div(2e4).toString(); // avg of LTV and liqThreshold.
                        let colId = pEle.collateralBalances[i].collateral.token.id;
                        let liquidationAmount = (0, big_js_1.default)(userDebtUSD).mul(1.1).mul(feeTokenPrice).toFixed(18); // increasing the price by 10% for safer side 
                        console.log(`avg:${avgFactor}, user: ${userHealthFactor}, liq ${colLiqFactors[i][1] / 1e4}`);
                        if (Number(colLiqFactors[i][1] / 1e4) < Number(userHealthFactor)) {
                            // call liquidate function
                            (0, liquidate_1.liquidate)(userId, liquidationAmount, colId, feeTokenId);
                            delete getIds?.ids[userId];
                            await db_1.LiqMonitor.findOneAndUpdate({}, { $set: { ids: getIds?.ids } });
                        }
                        if (Number(avgFactor) < Number(userHealthFactor)) {
                            flag = true;
                        }
                    }
                }
                if (flag == false) {
                    console.log("delete id watch");
                    delete getIds?.ids[userId];
                    await db_1.LiqMonitor.findOneAndUpdate({}, { $set: { ids: getIds?.ids } });
                }
            }
            start = end;
            end = end + 50;
        }
    }
    catch (error) {
        console.log(`Error @ getPosition`, error);
    }
}
