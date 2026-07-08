import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

  if (!mongoUri) {
    console.error(
      "MongoDB connection string is missing. Set MONGO_URI or MONGODB_URI in your environment.",
    );
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDb connected:${conn.connection.host}`);
    console.log(`MongoDb DatabaseName:${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    if (process.env.VERCEL !== "1") {
      process.exit(1);
    }
    return null;
  }
};

export default connectDB;
