import {ethers} from "ethers";
import {promises as fs} from "fs";
import path from "path";

require("dotenv").config()

setPrice("0x7c303B182D406D73b1e40cD9bdAFfc380D7e5FbE", "2560000000")
export async function setPrice(token: string, price: string) {
    try {
    const priceFeedAbi = JSON.parse((await fs.readFile(path.join(__dirname+"../../abi/MockPriceFeed.json"))).toString())["abi"];
      
    let provider = new ethers.providers.JsonRpcProvider("https://nd-389-970-162.p2pify.com/17b0fbe8312c9ff963057d537b9c7864");
    let user1 = new ethers.Wallet("0x7cf03fae45cb10d4e3ba00a10deeacfc8cea1be0eebcfb7277a7df2e5074a405"! as string).connect(provider); //2
    const priceFeed = new ethers.Contract(token, priceFeedAbi, provider);
    console.log(await priceFeed.connect(user1).setPrice(price, 8))
    }
    catch (error) {
        console.log(`Error @ liquidate`, error);
    }
}