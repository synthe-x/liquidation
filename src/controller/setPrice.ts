import {ethers} from "ethers";
import {promises as fs} from "fs";
import path from "path";

require("dotenv").config()

setPrice("0x04d3922c2b71FA9aB94b4e3A7fC00b42F8c9A63e", "2260000000")
export async function setPrice(token: string, price: string) {
    try {
    const priceFeedAbi = JSON.parse((await fs.readFile(path.join(__dirname+"../../abi/MockPriceFeed.json"))).toString())["abi"];
      
    let provider = new ethers.providers.JsonRpcProvider("https://nd-389-970-162.p2pify.com/17b0fbe8312c9ff963057d537b9c7864");
    let user1 = new ethers.Wallet("0x7eb134dfda0e927b286bdc4df02c6c21cc5ad3bec53e017240253e9dfe03745b"! as string).connect(provider); //2
    const priceFeed = new ethers.Contract(token, priceFeedAbi, provider);
    // console.log(await priceFeed.price())
    console.log(await priceFeed.connect(user1).setPrice(price, 8))
    }
    catch (error) {
        console.log(`Error @ liquidate`, error);
    }
}