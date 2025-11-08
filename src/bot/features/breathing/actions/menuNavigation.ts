import { Context } from "telegraf";
import {
  completeCallbackAction,
  sendCycleMenu,
} from "../../../utils/conversationTemplates";
// Импортируем наш унифицированный шаблон

// Обработчик кнопки "Назад в главное меню"
export async function handleBackToMainMenu(ctx: Context) {
  //   // 1. Отвечаем на callback (чтобы убрать "часы" с кнопки)
  //   await ctx.answerCbQuery("Возвращаемся к выбору практики...");

  //   // 2. 🚀 УДАЛЯЕМ ВСЕ СООБЩЕНИЕ с кнопкой "Назад"
  //   if (ctx.callbackQuery && ctx.callbackQuery.message) {
  //     try {
  //       const chatId = ctx.callbackQuery.message.chat.id;
  //       const messageId = ctx.callbackQuery.message.message_id;

  //       // Используем метод deleteMessage
  //       await ctx.telegram.deleteMessage(chatId, messageId);
  //     } catch (error) {
  //       // Ошибки могут возникнуть, если сообщение слишком старое (больше 48 часов)
  //       // или уже было удалено другим действием.
  //       console.error(
  //         "Не удалось удалить сообщение с кнопками:",
  //         (error as Error).message
  //       );
  //     }
  //   }

  // 3. ОТПРАВЛЯЕМ НОВОЕ СООБЩЕНИЕ с меню циклов
  const userName = ctx.from?.first_name || "друг";
  const text = `
Привет, ${userName}! Вы вернулись в главное меню.
Выберите новую практику для начала:
    `;

  // Используем наш унифицированный шаблон, который отправит текст + кнопки
  await sendCycleMenu(ctx, text);

  await completeCallbackAction(ctx, "Возвращаемся к выбору практики...");
}

// РЕГИСТРАЦИЯ (в bot.ts):
// bot.action("back_to_main_menu", handleBackToMainMenu);
