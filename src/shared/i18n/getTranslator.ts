import i18next from "./i18n";
import { Context } from "telegraf";

export function getTranslator(ctx: Context) {
  // Определяем язык Telegram или ставим английский по умолчанию
  const lang = ctx.from?.language_code || "en";
  // Возвращаем функцию, которая переводит с нужным языком
  return (key: string, options?: Record<string, any>) =>
    i18next.t(key, { lng: lang, ...options });
}
