
import { BigNumber, ethers } from "ethers";
import { getABI } from "./utils";

let assetPrice: any = {

}

/**
 * @dev this function is use to get onchain data for create order api, i.e balance and allowance
 * @param {*} token (string) address of token 
 * @param {*} maker (string) address of maker
 * @param {*} chainId (string) numeric chainId
 * @returns ([number])) [balance, allowance]
 */
export async function multicallForPriceFeed(token: string[]): Promise<number[] | null> {
    try {
        let provider = new ethers.providers.JsonRpcProvider("https://nd-389-970-162.p2pify.com/17b0fbe8312c9ff963057d537b9c7864");
        const multicall = new ethers.Contract(
            "0x7a69be2c6827F45A6A4eE94b7D1Ed8484d17fcb8",
            await getABI("Multicall2"),
            provider
        );
        const itf: ethers.utils.Interface = new ethers.utils.Interface(await getABI("MockPriceFeed"));
        console.log("itff", itf.encodeFunctionData("price", []))
        const input: string[][] = [];
        token.forEach((x) => {
            input.push([x, itf.encodeFunctionData("price")]);
        })
        console.log("input", input);
        let resp = await multicall.callStatic.aggregate(
            input
        );

        let outPut: number[] = [];

        for (let i = 0; i < resp[1].length; i++) {
            outPut.push(Number(BigNumber.from(resp[1][i]).toString()));
            assetPrice[`${token[i]}`] = Number(BigNumber.from(resp[1][i]).toString())
        }
        console.log("OutPut", outPut)


        return outPut

    }
    catch (error) {

        console.log(`Error @ Multicall`, error)
        return null
    }
}
{

}
multicallForPriceFeed(["0x869d29E13d5eeb19eA1f8bF477Ffe9C7582003b2", "0x0c0C1391E28860F976D2aB5087770C4Df3AD08ac"])
// aave, euroc, 