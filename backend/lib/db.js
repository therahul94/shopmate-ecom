import mongoose from "mongoose";

export const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected: "+ conn.connection.host);
    }catch(error) {
        console.log('Error connecting to mongodb', error.message);
        process.exit(1);// It means process failure, and instead of 1 if it is 0 then process success.
    }
}