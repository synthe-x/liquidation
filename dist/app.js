"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./src/db/db");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const morgan_1 = __importDefault(require("morgan"));
const Sentry = __importStar(require("@sentry/node"));
const compression_1 = __importDefault(require("compression"));
const watchForLiquidation_1 = require("./src/controller/watchForLiquidation");
const getPosition_1 = require("./src/controller/getPosition");
const getCollAddresses_1 = require("./src/util/getCollAddresses");
const getPoolDetails_1 = require("./src/controller/getPoolDetails");
const getOracleDetails_1 = require("./src/controller/getOracleDetails");
const httpServer = (0, http_1.createServer)(app);
// Sentry.init({
//     // @ts-ignore
//     dsn: "https://7d303c69af974f47aeb870a4537472ee@o4504400337698816.ingest.sentry.io/4504405098823680",
//     integrations: [
//         // enable HTTP calls tracing
//         new Sentry.Integrations.Http({ tracing: true }),
//         // enable Express.js middleware tracing
//         new Tracing.Integrations.Express({ app }),
//     ],
//     tracesSampleRate: 1.0,
//     enabled: process.env.NODE_ENV == "production"
// });
// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.tracingHandler());
app.use((0, compression_1.default)());
require("dotenv").config();
app.use((0, morgan_1.default)('dev'));
(0, db_1.connectToDB)();
app.use((0, cors_1.default)({
    origin: '*'
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
(async function start() {
    await (0, getCollAddresses_1.setCollAddresses)();
    await (0, getOracleDetails_1.startOracleData)();
    await (0, getPoolDetails_1.startPoolData)();
    (0, getPosition_1.startGetPosition)();
    (0, watchForLiquidation_1.watch)();
})();
// app.use(`/v/${getVersion(process.env.NODE_ENV!)}/pair`, pairRoutes);
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});
// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());
// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
    res.statusCode = 500;
    res.end(res.sentry + "\n");
});
let server = httpServer.listen(4000, function () {
    console.log("app running on port " + (4000));
});
function stop() {
    server.close();
}
module.exports = server;
module.exports.stop = stop;
