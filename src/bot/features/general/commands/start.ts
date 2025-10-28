import { Context } from "telegraf";
import { sendCycleMenu } from "../../../utils/conversationTemplates";

export async function startHandler(ctx: Context, isNewUser: boolean) {
  const userName = ctx.from?.first_name || "друг";

  const greeting = isNewUser
    ? `🧘‍♂️ Добро пожаловать, ${userName}!\nЯ Reset Flow Bot, твой личный тренер по дыханию. Выбери практику, чтобы начать.`
    : `🧘‍♂️ С возвращением, ${userName}!\nВыбери практику, чтобы продолжить тренировку:`;

  // Вызываем унифицированный шаблон
  await sendCycleMenu(ctx, greeting);
}
