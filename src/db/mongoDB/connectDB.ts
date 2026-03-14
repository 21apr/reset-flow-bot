import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export function connectDB() {
  const MONGODB_TOKEN: string | undefined = process.env.MONGODB_TOKEN;
  if (!MONGODB_TOKEN) {
    throw new Error("❌ MONGODB_TOKEN не найден в переменных окружения.");
  }

  mongoose
    .connect(MONGODB_TOKEN)
    .then(() => {
      console.log("✅ Connected to MongoDB");
    })
    .catch((err: Error) => {
      console.error("❌ MongoDB connection error:", err.message);
      process.exit(1);
    });
}
