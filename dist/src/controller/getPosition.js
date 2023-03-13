"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGetPosition = void 0;
const axios_1 = __importDefault(require("axios"));
const big_js_1 = __importDefault(require("big.js"));
const db_1 = require("../db/db");
const getOracleDetails_1 = require("./getOracleDetails");
const getPoolDetails_1 = require("./getPoolDetails");
const liquidate_1 = require("./liquidate");
function startGetPosition() {
    setInterval(() => {
        getPosition();
    }, 1 * 60 * 1000);
}
exports.startGetPosition = startGetPosition;
async function getPosition() {
    try {
        let _skip = 0;
        while (true) {
            let data = await (0, axios_1.default)({
                method: "post",
                url: `https://api.thegraph.com/subgraphs/name/prasad-kumkar/synthex-dev`,
                data: {
                    query: `
                {
                    accounts (first: 100, skip: ${_skip * 100}){
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
            if (accounts.length == 0) {
                break;
            }
            _skip++;
            for (let ele of accounts) {
                let userId = ele.id;
                console.log(userId);
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
                    console.log("health", userHealthFactor);
                    for (let i in colLiqFactors) {
                        let avgFactor = (0, big_js_1.default)(colLiqFactors[i][0]).plus(colLiqFactors[i][1]).div(2e4).toString();
                        let colId = pEle.collateralBalances[i].collateral.token.id;
                        let liquidationAmount = (0, big_js_1.default)(userDebtUSD).mul(1.1).mul(feeTokenPrice).toFixed(18); // increasing the price by 10% for safer side
                        if (Number(colLiqFactors[i][1] / 1e4) < Number(userHealthFactor)) {
                            // call liquidate function
                            let allIds = await db_1.LiqMonitor.findOne().lean();
                            (0, liquidate_1.liquidate)(userId, liquidationAmount, colId, feeTokenId);
                            if (allIds?.ids[userId]) {
                                delete allIds?.ids[userId];
                                await db_1.LiqMonitor.findOneAndUpdate({}, { $set: { ids: allIds?.ids } });
                            }
                        }
                        else if (Number(avgFactor) < Number(userHealthFactor)) {
                            // send ids on watching list;
                            let allIds = await db_1.LiqMonitor.findOne().lean();
                            let ids = {};
                            if (allIds && allIds.ids) {
                                ids = allIds.ids;
                            }
                            let temp = {};
                            temp["ids"] = ids;
                            temp["ids"][`${userId}`] = '0';
                            await db_1.LiqMonitor.findOneAndUpdate({}, { $set: temp }, { upsert: true });
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        console.log(`Error @ getPosition`, error);
    }
}
