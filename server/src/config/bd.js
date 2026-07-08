import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        const conn =await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDb connected:${conn.connection.host}`)
        console.log(`MongoDb DatabaseName:${conn.connection.name}`)
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
    }
} 

export default connectDB