import { Context } from "telegraf";
import {
  completeCallbackAction,
  sendCycleMenu,
} from "../../../utils/conversationTemplates";
export async function handleBackToMainMenu(ctx: Context) {
  const userName = ctx.from?.first_name || "friend";
  const text = `
Hello, ${userName}! You are back to the main menu.
Select a new practice to start:
    `;

  await sendCycleMenu(ctx, text);

  await completeCallbackAction(ctx, "Returning to practice selection...");
}
