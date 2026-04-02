import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    throw new Error("❌ MONGODB_URI not found in environment variables.");
  }

  try {
    await mongoose.connect(dbUri);
    console.log("✅ Connected to MongoDB (Local Docker Instance)");
  } catch (err) {
    const error = err as Error;
    console.error("❌ MongoDB connection error:", error.message);

    process.exit(1);
  }
}