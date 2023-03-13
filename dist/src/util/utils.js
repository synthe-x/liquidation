"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getABI = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
async function getABI(name) {
    try {
        const abi = (JSON.parse((await (fs_1.promises.readFile(path_1.default.join(__dirname + "../../abi/ABI.json")))).toString()))[name];
        return abi;
    }
    catch (error) {
        console.log(`Error @ getABI`, error);
    }
}
exports.getABI = getABI;
