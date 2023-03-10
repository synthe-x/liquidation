import axios from "axios"
import { promises as fs } from "fs";




export async function setCollAddresses() {
    try {

        let config = JSON.parse((await (fs.readFile(__dirname + "/config.json"))).toString());
        config = {};
        let data = await axios({

            method: "post",
            url: `https://api.thegraph.com/subgraphs/name/prasad-kumkar/synthex-dev`,
            data:
            {
                query: `
                {
                    pools {
                      id
                      name
                      symbol
                      feeToken{
                        id
                        token{
                          name
                          symbol
                        }
                      }
                      collaterals {
                        token {
                          id
                          name
                          symbol
                        }
                      }
                    }
                  }`
            }
        });



        const pools = data.data.data.pools;
        // console.log(pools)
        for (let pEle of pools) {
            config[pEle.id] = {
                name: pEle.name,
                symbol: pEle.symbol,
                feeToken: pEle.feeToken.id,
                collaterals: {}
            };

            for (let cEle of pEle.collaterals) {
                // console.log(cEle.token.symbol)
                config[pEle.id]["collaterals"][cEle.token.id] = ["0", cEle.token.symbol];
                config[pEle.id]["collaterals"][pEle.feeToken.id] = ["0", pEle.feeToken.token.symbol];

            }
        }

        await fs.writeFile(__dirname + "/config.json", JSON.stringify(config));

    }
    catch (error) {
        console.log(`Error @ getCollAddresses`, error)
    }
}