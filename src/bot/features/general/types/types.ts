import { Context as TelegrafContext } from "telegraf";

// Гибкий интерфейс для сессии
export interface MySession {
  // Это поле, которое вы хотите кэшировать
  languageCode?: string;
  // Добавьте другие известные поля
  userId?: number;

  // Позволяет добавлять любые другие поля динамически
  [key: string]: any;
}

// Расширяем Context, чтобы он знал о нашей сессии
export interface MyContext extends TelegrafContext {
  session: MySession;
}
