import express, { Request, Response } from "express";
import { Telegraf, Context } from "telegraf";
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

// Загрузка переменных окружения
dotenv.config();

// Инициализация Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Вы можете выбрать модель, например, 'gemini-2.5-flash'
const model = "gemini-2.5-flash";

// 1. Проверка и типизация переменных окружения
// ---------------------------------------------

const BOT_TOKEN: string | undefined = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("❌ BOT_TOKEN не найден в переменных окружения.");
}

const RENDER_URL: string | undefined = process.env.RENDER_URL;
if (!RENDER_URL) {
  console.warn("⚠️ RENDER_URL не найден. Пинг-функция не будет работать.");
}

// 3. Инициализация бота и сервера
// ---------------------------------------------
connectDB();

async function startBot() {
  await initI18n();
  const bot = new Telegraf<Context>(process.env.BOT_TOKEN!, {
    // Убедитесь, что настройка parse_mode находится внутри объекта telegram
    telegram: {
      parse_mode: "HTML", // Должен быть 'HTML' или 'MarkdownV2'
    },
  } as any);
  const app = express();

  await setBotCommands(bot);

  // 4. Логика бота
  // ---------------------------------------------

  bot.use((ctx, next) => {
    const originalReply = ctx.reply.bind(ctx);

    ctx.reply = (text, extra = {}) => {
      // Проверяем, содержит ли текст теги <a>, <pre> или <code> (чтобы избежать вложений)
      const hasFormatting =
        typeof text === "string" &&
        (text.includes("<a") ||
          text.includes("<pre") ||
          text.includes("<code"));

      if (typeof text === "string" && text.length > 0 && !hasFormatting) {
        // ... (оборачиваем в <code> и добавляем parse_mode: "HTML")
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

  // --- Обработчик команды /start ---
  bot.start(async (ctx) => {
    // 1. Получаем данные пользователя
    const telegramUser: ITelegramUser = {
      id: String(ctx.from.id),
      username: ctx.from.username,
      first_name: ctx.from.first_name || "друг",
    };

    try {
      // 2. Вызываем функцию Find or Create
      const { isNewUser } = await findOrCreateUser(
        telegramUser.id,
        telegramUser
      );

      // // 3. Отправляем приветствие и меню дыхания
      startHandler(ctx, isNewUser);
    } catch (error) {
      ctx.reply(
        "Произошла ошибка при обработке данных пользователя. Пожалуйста, попробуйте позже."
      );
    }
  });

  // Обработчик команды /feedback
  bot.command("feedback", async (ctx) => {
    const messageText = `
<b>💬 Обратная связь</b>

Чтобы отправить мне личное сообщение, просто нажмите на эту ссылку:

<a href="https://t.me/LARINALAB">Написать в личные сообщения</a>

Буду рад вашим вопросам или предложениям!
`;

    await ctx.reply(messageText, {
      parse_mode: "HTML", // Обязательно для форматирования ссылки
      link_preview_options: {
        is_disabled: true,
      },
    });
  });

  // // --- Обработчик для кнопок (Запуск тренажера) ---

  bot.action(/^select_cycle_(\d+)$/, handleDurationMenu);
  bot.action(/^start_cycle_(\d+)_(\d+)$/, handleBreathingCycleStart as any);

  bot.action("back_to_main_menu", handleBackToMainMenu);

  bot.on("text", async (ctx) => {
    // Внутри handleArbitraryText есть проверка, чтобы игнорировать команды
    await handleArbitraryText(ctx);
  });

  // const activeChats = new Map(); // Key: chat_id (number), Value: ChatSession (from Gemini API)

  // bot.on("text", async (ctx) => {
  //   // ... (пропускаем команды) ...
  //   const chatId = ctx.chat.id;
  //   const userPrompt = ctx.message.text;

  //   // 1. Получаем или создаем сессию чата
  //   if (!activeChats.has(chatId)) {
  //     const chat = ai.chats.create({
  //       model: model,
  //       config: {
  //         systemInstruction:
  //           "Ты — Reset Flow Bot, твоя задача — анализировать статистику пользователя по использоватнию бота дыхания, если такая передавалась отдельно. Если нет, просто болтать с пользователем. Будь эмпатичным, кратким и позитивным. Не вступай в длинные диалоги. Твой ответ должен быть простым не выходить за пределы 300 символов. Ты всегда отвечаешь на том же языке, на котором к тебе обращается пользователь.", // Ваш промпт
  //       },
  //     });
  //     activeChats.set(chatId, chat);
  //   }

  //   const chatSession = activeChats.get(chatId);

  //   // 2. Отправляем сообщение в сессию
  //   await ctx.sendChatAction("typing");
  //   const response = await chatSession.sendMessage({ message: userPrompt });

  //   // 3. Отправляем ответ
  //   ctx.reply(response.text);
  // });

  // 5. Настройка Express-сервера (остается без изменений)
  // ---------------------------------------------
  app.get("/", (req: Request, res: Response) => {
    res.send("Reset Flow Bot работает 🌊");
  });

  // 6. Запуск сервера и бота (остается без изменений)
  // ---------------------------------------------
  bot
    .launch()
    .then(() => console.log("🚀 Reset Flow Bot запущен"))
    .catch((err: Error) =>
      console.error("❌ Ошибка запуска бота:", err.message)
    );

  // Функция пинга для Render
  if (RENDER_URL) {
    setInterval(() => {
      // Убедитесь, что 'fetch' доступен в вашей версии Node.js или используйте 'node-fetch'
      fetch(RENDER_URL)
        .then(() => console.log("🌐 Ping sent to keep alive"))
        .catch((err) => console.error("❌ Ошибка пинга:", err.message));
    }, 14 * 60 * 1000);
  }

  // Запускаем веб-сервер
  const PORT: number = parseInt(process.env.PORT || "3000", 10);
  app.listen(PORT, () => console.log(`🌍 Server is listening on port ${PORT}`));

  // Обработчики для корректного останова бота
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

startBot();
