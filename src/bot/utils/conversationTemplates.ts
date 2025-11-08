import { Context } from "telegraf";
import { sendBreathingMenu } from "../keyboards/getBreathingKeyboard";
import i18next from "../../shared/i18n/i18n";

/**
 * Унифицированный шаблон для отправки меню выбора дыхательных циклов.
 * * @param ctx - Контекст Telegraf.
 * @param introductoryText - Текст, который будет показан пользователю.
 */
export async function sendCycleMenu(
  ctx: Context,
  introductoryText: string
): Promise<void> {
  const t = i18next.t.bind(i18next);
  // Получаем унифицированный объект клавиатуры
  const keyboard = sendBreathingMenu(t);

  // Отправляем сообщение, объединяя контекстный текст и кнопки
  await ctx.reply(introductoryText, keyboard);
}

type ExtendedActionContext = Context & {
  callbackQuery: any;
  // Добавьте сюда другие расширения, если они вам нужны
};

/**
 * Отвечает на callbackQuery и удаляет исходное сообщение с Inline-кнопками.
 * * @param ctx - Контекст Telegraf (должен содержать callbackQuery).
 * @param answerText - Текст для ответа на callbackQuery (появится как всплывающее уведомление).
 */
export async function completeCallbackAction(
  ctx: ExtendedActionContext,
  answerText: string = ""
) {
  // 1. Отвечаем на callback (Обязательный шаг)
  // Используйте ctx.answerCbQuery() для более лаконичного синтаксиса
  await ctx.answerCbQuery(answerText);

  // 2. Удаляем исходное сообщение с кнопками
  if (ctx.callbackQuery && ctx.callbackQuery.message) {
    try {
      // Telegraf, как правило, может использовать ctx.deleteMessage()
      // при обработке callbackQuery, но явный вызов через telegram более надежен
      await ctx.telegram.deleteMessage(
        ctx.callbackQuery.message.chat.id,
        ctx.callbackQuery.message.message_id
      );
    } catch (e) {
      // Игнорируем ошибку, если сообщение уже удалено
      console.warn(
        "Не удалось удалить сообщение после колбэка:",
        (e as Error).message
      );
    }
  }
}

/**
 * Унифицированный шаблон для удаления кнопок и ответа на колбэк.
 * Этот шаблон должен использоваться только внутри Middleware.
 * * @param ctx - Контекст Telegraf (предполагается CallbackQuery).
 */
export async function clearCallbackMenu(ctx: Context): Promise<void> {
  await ctx.answerCbQuery("");

  try {
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      // Редактируем сообщение, удаляя только кнопки
      await ctx.editMessageReplyMarkup(undefined);
    }
  } catch (e) {
    const error = e as Error;
    if (!error.message.includes("message is not modified")) {
      console.warn("Не удалось удалить кнопки:", error.message);
    }
  }
}
