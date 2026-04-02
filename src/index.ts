import { Telegraf, session } from "telegraf";
import dotenv from "dotenv";
import { ITelegramUser } from "./db/mongoDB/interfaces/User.interface";
import { findOrCreateUser } from "./db/mongoDB/service";
import { handleDurationMenu } from "./bot/keyboards/getDurationKeyboard";
import { startHandler } from "./bot/features/general/commands/start";
import { handleBackToMainMenu } from "./bot/features/breathing/actions/menuNavigation";
import { handleBreathingCycleStart } from "./bot/keyboards/breathing_btn";
import { connectDB } from "./db/mongoDB/connectDB";
import { setBotCommands } from "./bot/utils/commands";
import { handleArbitraryText } from "./bot/features/general/handlers/textHandler";
import { initI18n } from "./shared/i18n/i18n";
import { MyContext, MySession } from "./bot/features/general/types/types";
import { i18nMiddleware } from "./shared/i18n/i18nMiddleware";
import { feedbackHandler } from "./bot/features/general/commands/feedback";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("❌ BOT_TOKEN not found in environment variables.");
}

async function startBot() {
  try {
    await connectDB();
    await initI18n();

    const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!, {
      telegram: { parse_mode: "HTML" },
    } as any);

    bot.use(session<MySession, MyContext>({ defaultSession: () => ({}) }));
    bot.use(i18nMiddleware);
    await setBotCommands(bot);

    bot.use((ctx, next) => {
      const originalReply = ctx.reply.bind(ctx);
      ctx.reply = (text, extra = {}) => {
        const hasFormatting =
          typeof text === "string" &&
          (text.includes("<a") || text.includes("<pre") || text.includes("<code"));

        if (typeof text === "string" && text.length > 0 && !hasFormatting) {
          return originalReply(`<code>${text}</code>`, { ...extra, parse_mode: "HTML" });
        }
        return originalReply(text, extra);
      };
      return next();
    });

    await setBotCommands(bot);

    bot.start(async (ctx) => {
      const telegramUser: ITelegramUser = {
        id: String(ctx.from.id),
        username: ctx.from.username,
        first_name: ctx.from.first_name || "friend",
        language_code: ctx.from.language_code || "en",
      };

      try {
        const { isNewUser } = await findOrCreateUser(telegramUser.id, telegramUser);
        startHandler(ctx, isNewUser);
      } catch (error) {
        console.error("DB Error:", error);
        ctx.reply("An error occurred while processing user data.");
      }
    });

    bot.command("feedback", feedbackHandler);
    bot.action(/^select_cycle_(\d+)$/, handleDurationMenu);
    bot.action(/^start_cycle_(\d+)_(\d+)$/, handleBreathingCycleStart as any);
    bot.action("back_to_main_menu", handleBackToMainMenu);

    bot.on("text", async (ctx) => {
      await handleArbitraryText(ctx);
    });

    await bot.launch();
    console.log("🚀 Reset Flow Bot successfully started on VPS");

    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));

  } catch (error) {
    console.error("❌ Critical error during bot startup:", error);
    process.exit(1);
  }
}

startBot();
