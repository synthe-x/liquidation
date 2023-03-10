import express from "express";
import { connectToDB } from "./src/db/db";
import cors from "cors";
const app = express();
import helmet from "helmet";
import { createServer } from "http";
import morgan from 'morgan';
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import compression from "compression";
import { watch } from "./src/controller/watchForLiquidation";
import { startGetPosition } from "./src/controller/getPosition";
import { getPrices } from "./src/controller/getOraclePrice";
import { getPoolData } from "./src/controller/getPoolDetails";
import { setCollAddresses } from "./src/util/getCollAddresses";
const httpServer = createServer(app);


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

app.use(compression());

require("dotenv").config()

app.use(morgan('dev'));

connectToDB();
app.use(cors({
    origin: '*'
}));
app.use(helmet());
app.use(express.json());



(async function start() {
    await setCollAddresses()
    await getPrices()
    getPoolData()
    startGetPosition()
    watch();
})()


// app.use(`/v/${getVersion(process.env.NODE_ENV!)}/pair`, pairRoutes);



app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});






// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err: any, req: any, res: any, next: any) {
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
