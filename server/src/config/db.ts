// src/config/db.ts
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("🔥 MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed");
    console.error(err);
    process.exit(1);
  }
};
