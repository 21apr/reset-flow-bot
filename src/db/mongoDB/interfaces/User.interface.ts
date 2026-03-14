import { Document } from "mongoose";

export interface ITelegramUser {
  id: string;
  username: string | undefined;
  first_name: string;
  language_code?: string;
}

export interface IUser extends Document {
  telegramId: string;
  username: string | null;
  firstName: string | null;
  registrationDate: Date;
  totalBreathingSeconds: number;
  language: string;
}
