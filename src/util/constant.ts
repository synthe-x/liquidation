import { ethers } from "ethers";

export const getAddress: any = {
    "WBTC": "0x1b344e5c43dd2c8acf54e4608dbec1933abaeb73",
    "wstETH": "0xfa4f16a35234ec16795da14a86781acdaa6dc6ec",
    "AAVE": "0x8f09710d35bbd194137f9bbf949a398545f7f742",
    "LINK": "0xf402c4651bf47fba5ca37c231d31e77eed66c512",
    "cBTC": "0xf23981100b1801c903c7ceefaf4d44c72d9e3266",
    "cETH": "0x68c641df18ae341e7573e2931568cadb41446240",
    "cUSDC": "0xe5da0e2d0e6641bf492b61070be853e84bfc2465",
    "cLINK": "0xd2bf3a2f1cd21b9953aa7552e95b4a15cfc146b4",
    "cBNB": "0xb5423c95cf4a32debc28720b8bda05da9b1b84f6",
    "cSOL": "0xb65d3a22ec9c1000fc0739e0fdb1470cb698246f",
    "cAPE": "0xe64b13eb509a471c56bb45122b32d0d9452a1ed8",
    "cMATIK": "0x7cf5a763e132522ce37f5ed141a0feb48ddc6092",
    "fUSD": "0x34171f5a13fcaff3ec780562be80695600807845",
    "fEUR": "0x8459a42884548a80215fde8db373518383c387ab",
    "fJPY": "0x4c762307f679d4ec4d6999e3a6182fc33b7489df",
    "fCAD": "0x9e523bbcf1b99c68a41ca2942b9fec7bce24c284",
    "fWON": "0x238aa3f869020f29f2db755e03ca53e367fe7b36",
    "fAED": "0x2a4215664bcef0652c7b521f22d1e852ae33ed45",
    "fINR": "0x0fdd4d83c6be1464a89c95b5855c6de73be50385",
    "USDT": "0xfbb31bc417dda5d5b6addd935143fd13a94bba69",
    "DAI": "0x46b564dec8a27799319e6b5ad0514ba7553af431",
    "EUROC": "0x11261a860f34d0a21748bb57f21465c71a751250",
    "aArbUSDC": "0xe3cdeaeef95e5b5411022ba20e0b32f58ccbb452",
    "USDC": "0x9d1abb08afc49c485d861b03fb796265f177016e",
}

export let getPricesC = {
    "0x1b344e5c43dd2c8acf54e4608dbec1933abaeb73": [null, "WBTC"],
    "0xfa4f16a35234ec16795da14a86781acdaa6dc6ec": [null, "wstETH"],
    "0x8f09710d35bbd194137f9bbf949a398545f7f742": [null, "AAVE"],
    "0xf402c4651bf47fba5ca37c231d31e77eed66c512": [null, "LINK"],
    "0xf23981100b1801c903c7ceefaf4d44c72d9e3266": [null, "cBTC"],
    "0x68c641df18ae341e7573e2931568cadb41446240": [null, "cETH"],
    "0xe5da0e2d0e6641bf492b61070be853e84bfc2465": [null, "cUSDC"],
    "0xd2bf3a2f1cd21b9953aa7552e95b4a15cfc146b4": [null, "cLINK"],
    "0xb5423c95cf4a32debc28720b8bda05da9b1b84f6": [null, "cBNB"],
    "0xb65d3a22ec9c1000fc0739e0fdb1470cb698246f": [null, "cSOL"],
    "0xe64b13eb509a471c56bb45122b32d0d9452a1ed8": [null, "cAPE"],
    "0x7cf5a763e132522ce37f5ed141a0feb48ddc6092": [null, "cMATIK"],
}

export let getPricesF: any = {
    "0x34171f5a13fcaff3ec780562be80695600807845": [null, "fUSD"],
    "0x8459a42884548a80215fde8db373518383c387ab": [null, "fEUR"],
    "0x4c762307f679d4ec4d6999e3a6182fc33b7489df": [null, "fJPY"],
    "0x9e523bbcf1b99c68a41ca2942b9fec7bce24c284": [null, "fCAD"],
    "0x238aa3f869020f29f2db755e03ca53e367fe7b36": [null, "fWON"],
    "0x2a4215664bcef0652c7b521f22d1e852ae33ed45": [null, "fAED"],
    "0x0fdd4d83c6be1464a89c95b5855c6de73be50385": [null, "fINR"],
    "0xfbb31bc417dda5d5b6addd935143fd13a94bba69": [null, "USDT"],
    "0x46b564dec8a27799319e6b5ad0514ba7553af431": [null, "DAI"],
    "0x11261a860f34d0a21748bb57f21465c71a751250": [null, "EUROC"],
    "0xe3cdeaeef95e5b5411022ba20e0b32f58ccbb452": [null, "aArbUSDC"],
    "0x9d1abb08afc49c485d861b03fb796265f177016e": [null, "USDC"],
}

export const addressC = "0x70caD3491303e9b291ea57e307Fd6607156e1735";
export const addressF = "0xE24B9bE4d6823FD84895D42750d31ECE38Ba9e4b";
export const poolCAddress = "0xf1EAf38b3F1B2890e7Ef861bBC151AfE83BE564d".toLowerCase()
export const poolFAddress = "0xc2106398EF704ce56100e834dE99f265cAe86BDc".toLowerCase()
export const provider = new ethers.providers.JsonRpcProvider("https://nd-389-970-162.p2pify.com/17b0fbe8312c9ff963057d537b9c7864");