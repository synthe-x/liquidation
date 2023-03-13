import mongoose from "mongoose";

const LiqMonitorSchema = new mongoose.Schema({
   ids:Object
},
    { timestamps: true }
);


export default LiqMonitorSchema;