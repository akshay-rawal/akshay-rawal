import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async ()=> {
    try {
          const connectionInstnce = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
          console.log(`\n MongoDB connected !! DB host:${connectionInstnce.connection.host}`);
          
          
          
    } catch (error) {
        console.log("mongoDB connection error",error);
        process.exit(0);
        
    }
}
export default connectDB;