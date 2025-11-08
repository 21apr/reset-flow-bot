// index.ts или middlewares/i18n.middleware.ts
// Предположим, вы экспортировали экземпляр i18n из файла initI18n
import { MyContext } from "../../bot/features/general/types/types";
import i18next from "./i18n";

/**
 * Middleware для установки языка i18next из сессии Telegraf.
 */
export function i18nMiddleware(ctx: MyContext, next: () => Promise<void>) {
  // 1. Извлекаем languageCode из сессии (кэша)
  const language = ctx.session.languageCode;

  if (language) {
    // 2. Устанавливаем извлеченный язык в i18next для текущего запроса
    i18next.changeLanguage(language);
  } else {
    // 3. Если языка в сессии нет, используем язык из Telegram (если доступен)
    // и устанавливаем его в сессию для кэширования в будущем.
    const telegramLang = ctx.from?.language_code || "en";

    ctx.session.languageCode = telegramLang; // Сохраняем для кэша
    i18next.changeLanguage(telegramLang); // Устанавливаем в i18next
  }

  return next();
}
