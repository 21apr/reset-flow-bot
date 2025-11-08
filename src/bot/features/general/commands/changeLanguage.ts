// bot/features/general/commands/language.handler.ts

import { Markup } from "telegraf";
import i18next from "../../../../shared/i18n/i18n";
import { updateUserLanguageInDB } from "../../../db/mongoDB/service"; // <---
import { MyContext } from "../types/types";

// Доступные языки, которые вы поддерживаете
const AVAILABLE_LANGUAGES = [
  { code: "ru", name: "Русский" },
  { code: "en", name: "English" },
  // Добавьте другие, если нужно
];

// --- Отображение меню выбора языка ---
export async function languageHandler(ctx: MyContext) {
  const t = i18next.t.bind(i18next);

  const languageButtons = AVAILABLE_LANGUAGES.map((lang) => {
    const checkmark = ctx.session.languageCode === lang.code ? "✅ " : "";
    // CALLBACK_DATA: set_lang_КОД
    return Markup.button.callback(
      `${checkmark}${lang.name}`,
      `set_lang_${lang.code}`
    );
  });

  const keyboard = Markup.inlineKeyboard(languageButtons, { columns: 2 });

  await ctx.reply(t("commands.language_prompt"), keyboard);
}

// --- Обработчик нажатия кнопки языка ---
export async function setLanguageAction(ctx: MyContext) {
  if (!ctx.callbackQuery || !ctx.match) return;

  // 1. Извлекаем код языка из колбэка: set_lang_КОД
  const newLanguageCode = ctx.match[1];
  const t = i18next.t.bind(i18next);

  if (!AVAILABLE_LANGUAGES.some((lang) => lang.code === newLanguageCode)) {
    await ctx.answerCbQuery(t("error.invalid_language"));
    return;
  }

  const userId = String(ctx.from!.id);

  try {
    // 2. ОБНОВЛЕНИЕ БД: Устанавливаем новый язык в MongoDB
    await updateUserLanguageInDB(userId, newLanguageCode);

    // 3. ОБНОВЛЕНИЕ СЕССИИ: Устанавливаем новый язык в кэш
    ctx.session.languageCode = newLanguageCode;

    // 4. ОБНОВЛЕНИЕ i18next: Меняем язык для текущего запроса,
    // чтобы ответ был на новом языке
    i18next.changeLanguage(newLanguageCode);
    const newT = i18next.t.bind(i18next); // Новая функция t с новым языком

    // 5. Отправка ответа
    await ctx.editMessageText(newT("message.language_changed"), {
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback(newT("button.close_menu"), "close")],
      ]).reply_markup,
    });

    await ctx.answerCbQuery(newT("message.language_changed_cb"));
  } catch (error) {
    console.error("Ошибка смены языка:", error);
    await ctx.answerCbQuery(t("error.db_error"));
  }
}

// --- Утилитарный обработчик для закрытия меню ---
export async function closeMenuAction(ctx: MyContext) {
  if (!ctx.callbackQuery) return;
  await ctx.deleteMessage();
  await ctx.answerCbQuery();
}
