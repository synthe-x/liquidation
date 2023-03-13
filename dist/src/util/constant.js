"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = exports.poolFAddress = exports.poolCAddress = exports.addressF = exports.addressC = exports.oracleAddress = void 0;
const ethers_1 = require("ethers");
exports.oracleAddress = {
    "0x8ac3734a1d2a2c37de95f332833381eec844f297": "0x0949b09437660fc87D80330Fd2F2915F45204DDc",
    "0x7499ea6c7786a6cd913267108f8b69c9e4f02bd1": "0x4753C420863bf24708d09FDAC1fBaf0C2AF71d87"
};
exports.addressC = "0x0949b09437660fc87D80330Fd2F2915F45204DDc";
exports.addressF = "0x4753C420863bf24708d09FDAC1fBaf0C2AF71d87";
exports.poolCAddress = "0x8AC3734A1D2a2C37De95f332833381eEc844F297".toLowerCase();
exports.poolFAddress = "0x7499EA6C7786a6cD913267108f8B69c9e4F02BD1".toLowerCase();
exports.provider = new ethers_1.ethers.providers.JsonRpcProvider("https://nd-389-970-162.p2pify.com/17b0fbe8312c9ff963057d537b9c7864");
