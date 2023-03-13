"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCollAddresses = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
async function setCollAddresses() {
    try {
        let config = JSON.parse((await (fs_1.promises.readFile(__dirname + "/config.json"))).toString());
        config = {};
        let data = await (0, axios_1.default)({
            method: "post",
            url: `https://api.thegraph.com/subgraphs/name/prasad-kumkar/synthex-dev`,
            data: {
                query: `
                {
                    pools {
                      id
                      name
                      symbol
                      oracle
                      feeToken{
                        id
                        token{
                          symbol
                        }
                      }
                      collaterals {
                        token {
                          id
                          symbol
                        }
                      }
                    }
                  }`
            }
        });
        const pools = data.data.data.pools;
        for (let pEle of pools) {
            config[pEle.id] = {
                name: pEle.name,
                symbol: pEle.symbol,
                feeToken: pEle.feeToken.id,
                oracle: pEle.oracle,
                collaterals: {}
            };
            for (let cEle of pEle.collaterals) {
                config[pEle.id]["collaterals"][cEle.token.id] = ["0", cEle.token.symbol];
                config[pEle.id]["collaterals"][pEle.feeToken.id] = ["0", pEle.feeToken.token.symbol];
            }
        }
        await fs_1.promises.writeFile(__dirname + "/config.json", JSON.stringify(config));
    }
    catch (error) {
        console.log(`Error @ getCollAddresses`, error);
    }
}
exports.setCollAddresses = setCollAddresses;
