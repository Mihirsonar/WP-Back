import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);

    isConnected = db.connections[0].readyState;
    console.log("MongoDB connected");
  } catch (error) {
  
    console.log("DB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;