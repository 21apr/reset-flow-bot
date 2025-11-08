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
      console.log("✅ Подключено к MongoDB");
    })
    .catch((err: Error) => {
      console.error("❌ Ошибка подключения к MongoDB:", err.message);
      // Может быть полезно завершить процесс, если БД необходима
      process.exit(1);
    });
}
