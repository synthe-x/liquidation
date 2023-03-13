import mongoose from "mongoose";

require('dotenv').config()


import LiqMonitorSchema from "../schema/LiquidationMonitor";

const LiqMonitor = mongoose.model("LiqMonitor", LiqMonitorSchema)

async function connectToDB() {
    mongoose.set('strictQuery', true)
    mongoose.connect(process.env.MONGO_URL + `-synthex-liq?retryWrites=true&w=majority`! as string)
        .then(() => {
            console.log("MongoDb is connected")
        })
        .catch(err => {
            console.log(err)
        }
        );

}






export { connectToDB, LiqMonitor };
