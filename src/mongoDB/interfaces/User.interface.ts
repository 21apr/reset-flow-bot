import { Document } from "mongoose";

// Интерфейс для данных, которые мы ожидаем получить от Telegram
export interface ITelegramUser {
  id: string; // Уникальный ID пользователя Telegram
  username: string | undefined; // Может отсутствовать
  first_name: string;
}

// Интерфейс для документа, который будет храниться в MongoDB
export interface IUser extends Document {
  telegramId: string;
  username: string | null;
  firstName: string | null;
  registrationDate: Date;
  // ... любые другие поля, которые вы добавите
}
