import { Context } from "telegraf";
import { sendBreathingMenu } from "../breathing/getBreathingKeyboard";

/**
 * Отправляет шутливый ответ, когда пользователь вводит произвольный текст,
 * и предлагает ему выбрать один из дыхательных циклов.
 * * @param ctx - Контекст Telegraf.
 */
export async function handleArbitraryText(ctx: Context) {
  // Проверяем, что это текстовое сообщение, и оно не является командой (начинается с '/')
  if (ctx.message && "text" in ctx.message) {
    const text = ctx.message.text.trim();

    // Игнорируем команды, чтобы не перехватить их логику
    if (text.startsWith("/")) {
      return; // Выходим, чтобы команду обработал соответствующий handler
    }

    // Шутливый и полезный ответ
    const replyText = `
🤖 Ой, прости! Пока я умею обрабатывать только команды. Твой текст, к сожалению, остается для меня загадкой. 😅

Сфокусируемся на главном! Выбери один из предложенных циклов ниже, чтобы начать тренировку:
    `;

    // Отправляем сообщение с клавиатурой дыхательных циклов
    await ctx.reply(replyText, sendBreathingMenu());
  }
}
