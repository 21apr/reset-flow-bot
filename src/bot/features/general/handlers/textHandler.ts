import { Context } from "telegraf";
import { sendCycleMenu } from "../../../utils/conversationTemplates";

export async function handleArbitraryText(ctx: Context) {
  if (ctx.message && "text" in ctx.message) {
    const text = ctx.message.text.trim();

    if (text.startsWith("/")) {
      return;
    }

    const replyText = `
🤖 Oops! Currently, I can only handle specific commands. Your text is a bit of a mystery to me. 😅

Let's focus on what's important! Select one of the breathing practices below to start:
    `;

    await sendCycleMenu(ctx, replyText);
  }
}
