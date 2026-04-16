import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Organization from "./models/organization.model.js";

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/techvaseegrah", { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(async () => {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    await Organization.updateMany(
        { subscriptionStatus: "active" }, 
        { $set: { endDate: oneMonthFromNow, currentPeriodEnd: oneMonthFromNow } }
    );
    
    console.log("Updated active orgs to 1 month!");
    process.exit(0);
});
