// src/models/User.model.ts
import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../interfaces/User.interface"; // Импортируем созданный интерфейс

// 1. Определение Схемы
const UserSchema: Schema = new Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true, // Гарантирует, что ID не дублируется
    index: true, // Индексируем для быстрого поиска
  },
  username: {
    type: String,
    default: null,
  },
  firstName: {
    type: String,
    default: null,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
});

// 2. Создание Модели с типизацией
// Модель типизируется с помощью IUser (интерфейс документа)
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
