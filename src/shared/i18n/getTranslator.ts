import i18next from "./i18n";
import { Context } from "telegraf";

export function getTranslator(ctx: Context) {
  const lang = ctx.from?.language_code || "en";
  return (key: string, options?: Record<string, any>) =>
    i18next.t(key, { lng: lang, ...options });
}
