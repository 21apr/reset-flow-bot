import express, { Request, Response } from "express";
import { Telegraf, session } from "telegraf";
import { ParseMode } from "telegraf/typings/core/types/typegram";
import dotenv from "dotenv";
import { ITelegramUser } from "./db/mongoDB/interfaces/User.interface";
import { findOrCreateUser } from "./db/mongoDB/service";
import { handleDurationMenu } from "./bot/keyboards/getDurationKeyboard";
import { startHandler } from "./bot/features/general/commands/start";
import { handleBackToMainMenu } from "./bot/features/breathing/actions/menuNavigation";
import { handleBreathingCycleStart } from "./bot/keyboards/breathing_btn";
import { GoogleGenAI } from "@google/genai";
import { connectDB } from "./db/mongoDB/connectDB";
import { setBotCommands } from "./bot/utils/commands";
import { handleArbitraryText } from "./bot/features/general/handlers/textHandler";
import { initI18n } from "./shared/i18n/i18n";
import { MyContext, MySession } from "./bot/features/general/types/types";
import { i18nMiddleware } from "./shared/i18n/i18nMiddleware";
import { feedbackHandler } from "./bot/features/general/commands/feedback";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

const app = express();

const BOT_TOKEN: string | undefined = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("❌ BOT_TOKEN не найден в переменных окружения.");
}

const RENDER_URL: string | undefined = process.env.RENDER_URL;
if (!RENDER_URL) {
  console.warn("⚠️ RENDER_URL не найден. Пинг-функция не будет работать.");
}

connectDB();

async function startBot() {
  await initI18n();
  const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!, {
    telegram: {
      parse_mode: "HTML",
    },
  } as any);

  bot.use(
    session<MySession, MyContext>({
      defaultSession: () => ({}),
    })
  );

  bot.use(i18nMiddleware);

  await setBotCommands(bot);

  bot.use((ctx, next) => {
    const originalReply = ctx.reply.bind(ctx);

    ctx.reply = (text, extra = {}) => {
      const hasFormatting =
        typeof text === "string" &&
        (text.includes("<a") ||
          text.includes("<pre") ||
          text.includes("<code"));

      if (typeof text === "string" && text.length > 0 && !hasFormatting) {
        const monospacedText = `<code>${text}</code>`;

        const options = {
          ...extra,
          parse_mode: "HTML" as ParseMode,
        };

        return originalReply(monospacedText, options);
      }

      return originalReply(text, extra);
    };

    return next();
  });

  bot.start(async (ctx) => {
    const telegramUser: ITelegramUser = {
      id: String(ctx.from.id),
      username: ctx.from.username,
      first_name: ctx.from.first_name || "friend",
      language_code: ctx.from.language_code || "en",
    };

    try {
      const { isNewUser } = await findOrCreateUser(
        telegramUser.id,
        telegramUser
      );

      startHandler(ctx, isNewUser);
    } catch (error) {
      ctx.reply(
        "Произошла ошибка при обработке данных пользователя. Пожалуйста, попробуйте позже."
      );
    }
  });

  bot.command("feedback", feedbackHandler);

  bot.action(/^select_cycle_(\d+)$/, handleDurationMenu);
  bot.action(/^start_cycle_(\d+)_(\d+)$/, handleBreathingCycleStart as any);
  bot.action("back_to_main_menu", handleBackToMainMenu);

  bot.on("text", async (ctx) => {
    await handleArbitraryText(ctx);
  });

  app.get("/", (req: Request, res: Response) => {
    res.send("Reset Flow Bot work🌊");
  });

  bot
    .launch()
    .then(() => console.log("🚀 Reset Flow Bot started"))
    .catch((err: Error) =>
      console.error("❌ Ошибка запуска бота:", err.message)
    );

  if (RENDER_URL) {
    setInterval(() => {
      fetch(RENDER_URL)
        .then(() => console.log("🌐 Ping sent to keep alive"))
        .catch((err) => console.error("❌ Ping error:", err.message));
    }, 14 * 60 * 1000);
  }

  const PORT: number = parseInt(process.env.PORT || "3000", 10);
  app.listen(PORT, () => console.log(`🌍 Server is listening on port ${PORT}`));

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

startBot();
