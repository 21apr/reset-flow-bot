import { Context } from "telegraf";

// Определяем тип для вашей асинхронной функции-обработчика
type CallbackHandler = (ctx: Context) => Promise<any>;

/**
 * Обертка для обработчиков колбэков, которая автоматически удаляет
 * исходное сообщение с Inline-кнопками после выполнения основной логики.
 * * @param handler - Ваша основная асинхронная функция-обработчик.
 * @returns Новую функцию-обработчик, включающую логику удаления.
 */
export const deleteMessageAfterCallback = (
  handler: CallbackHandler
): CallbackHandler => {
  return async (ctx: Context) => {
    // 1. Вызываем основную логику обработчика
    await handler(ctx);

    // 2. Удаляем исходное сообщение с кнопками
    try {
      // Это работает для нажатий на Inline-кнопки (callback_query)
      if (ctx.callbackQuery && ctx.callbackQuery.message) {
        // chat_id и message_id берутся из объекта сообщения,
        // которое было прикреплено к колбэку.
        await ctx.telegram.deleteMessage(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id
        );
      }
    } catch (e) {
      // Игнорируем ошибку, если сообщение уже удалено или не существует
      console.warn(
        "Не удалось удалить сообщение после колбэка:",
        (e as Error).message
      );
    }

    // 3. Отвечаем на колбэк, чтобы убрать "часы" с кнопки
    // Это стандартная и важная практика для callbackQuery.
    await ctx.answerCbQuery();
  };
};
