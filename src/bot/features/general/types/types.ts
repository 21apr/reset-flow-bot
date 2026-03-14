import { Context as TelegrafContext } from "telegraf";

export interface MySession {
  languageCode?: string;
  userId?: number;

  [key: string]: any;
}

export interface MyContext extends TelegrafContext {
  session: MySession;
}
