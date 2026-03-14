import { MyContext } from "../../bot/features/general/types/types";
import i18next from "./i18n";

export function i18nMiddleware(ctx: MyContext, next: () => Promise<void>) {
  const language = ctx.session.languageCode;

  if (language) {
    i18next.changeLanguage(language);
  } else {
    const telegramLang = ctx.from?.language_code || "en";

    ctx.session.languageCode = telegramLang;
    i18next.changeLanguage(telegramLang);
  }

  return next();
}
