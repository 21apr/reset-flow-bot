import { Context } from "telegraf";
import { sendBreathingMenu } from "../keyboards/getBreathingKeyboard";
import i18next from "../../shared/i18n/i18n";

export async function sendCycleMenu(
  ctx: Context,
  introductoryText: string
): Promise<void> {
  const t = i18next.t.bind(i18next);
  const keyboard = sendBreathingMenu(t);

  await ctx.reply(introductoryText, keyboard);
}

type ExtendedActionContext = Context & {
  callbackQuery: any;
};

export async function completeCallbackAction(
  ctx: ExtendedActionContext,
  answerText: string = ""
) {
  await ctx.answerCbQuery(answerText);

  if (ctx.callbackQuery && ctx.callbackQuery.message) {
    try {
      await ctx.telegram.deleteMessage(
        ctx.callbackQuery.message.chat.id,
        ctx.callbackQuery.message.message_id
      );
    } catch (e) {
      console.warn(
        "Failed to delete message after callback:",
        (e as Error).message
      );
    }
  }
}

export async function clearCallbackMenu(ctx: Context): Promise<void> {
  await ctx.answerCbQuery("");

  try {
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      await ctx.editMessageReplyMarkup(undefined);
    }
  } catch (e) {
    const error = e as Error;
    if (!error.message.includes("message is not modified")) {
      console.warn("Failed to clear buttons:", error.message);
    }
  }
}
