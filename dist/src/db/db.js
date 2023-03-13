"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiqMonitor = exports.connectToDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require('dotenv').config();
const LiquidationMonitor_1 = __importDefault(require("../schema/LiquidationMonitor"));
const LiqMonitor = mongoose_1.default.model("LiqMonitor", LiquidationMonitor_1.default);
exports.LiqMonitor = LiqMonitor;
async function connectToDB() {
    console.log(process.env.MONGO_URL + `-synthex-liq?retryWrites=true&w=majority`);
    mongoose_1.default.connect(process.env.MONGO_URL + `-synthex-liq?retryWrites=true&w=majority`)
        .then(() => {
        console.log("MongoDb is connected");
    })
        .catch(err => {
        console.log(err);
    });
}
exports.connectToDB = connectToDB;
