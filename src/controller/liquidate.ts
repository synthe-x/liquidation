
import { ethers } from "ethers";
import { promises as fs } from "fs";
import path from "path";

require("dotenv").config()

export async function liquidate(userId: string, amount: string, collateralId: string, synthId: string) {
    try {
        const getLiquidateAbi = JSON.parse((await fs.readFile(path.join(__dirname + "../../abi/ERC20X.json"))).toString())["abi"];
        const priceFeedAbi = JSON.parse((await fs.readFile(path.join(__dirname + "../../abi/MockPriceFeed.json"))).toString())["abi"];
        let provider = new ethers.providers.JsonRpcProvider("https://nd-389-970-162.p2pify.com/17b0fbe8312c9ff963057d537b9c7864");
        let user1 = new ethers.Wallet(process.env.PRIVATE_KEY1! as string).connect(provider);
        // let user1 = new ethers.Wallet("0x7cf03fae45cb10d4e3ba00a10deeacfc8cea1be0eebcfb7277a7df2e5074a405"! as string).connect(provider); //2
        console.log("Inside liquidation============================================");

        const synth = new ethers.Contract(synthId, getLiquidateAbi, provider);

        amount = ethers.utils.parseEther(amount).toString();

        console.log(userId, amount, collateralId, synthId)

        const liq = await synth.connect(user1).liquidate(userId, amount, collateralId);

        console.log(liq)
    }
    catch (error) {
        console.log(`Error @ liquidate`, error);
    }
}