import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { Telegraf, Markup, Context } from "telegraf";
import { ParseMode } from "telegraf/typings/core/types/typegram";
import dotenv from "dotenv";
import { ITelegramUser } from "./mongoDB/interfaces/User.interface";
import { findOrCreateUser } from "./mongoDB/service";
import { CYCLES } from "./bot_features/breathing/cycles";
import { handleBreathingCycleStart } from "./bot_features/bns_menu/breathing_btn/breathing_btn";
import { handleDurationMenu } from "./bot_features/bns_menu/duration_btn";

// Загрузка переменных окружения
dotenv.config();

// 1. Проверка и типизация переменных окружения
// ---------------------------------------------
const MONGODB_TOKEN: string | undefined = process.env.MONGODB_TOKEN;
if (!MONGODB_TOKEN) {
  throw new Error("❌ MONGODB_TOKEN не найден в переменных окружения.");
}

const BOT_TOKEN: string | undefined = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("❌ BOT_TOKEN не найден в переменных окружения.");
}

const RENDER_URL: string | undefined = process.env.RENDER_URL;
if (!RENDER_URL) {
  console.warn("⚠️ RENDER_URL не найден. Пинг-функция не будет работать.");
}

// 2. Настройка подключения к MongoDB
// ---------------------------------------------
mongoose
  .connect(MONGODB_TOKEN)
  .then(() => {
    console.log("✅ Подключено к MongoDB");
  })
  .catch((err: Error) => {
    console.error("❌ Ошибка подключения к MongoDB:", err.message);
  });

// 3. Инициализация бота и сервера
// ---------------------------------------------

const bot = new Telegraf<Context>(BOT_TOKEN, {
  // Убедитесь, что настройка parse_mode находится внутри объекта telegram
  telegram: {
    parse_mode: "HTML", // Должен быть 'HTML' или 'MarkdownV2'
  },
} as any);
const app = express();

// 4. Логика бота
// ---------------------------------------------

bot.use((ctx, next) => {
  const originalReply = ctx.reply.bind(ctx);

  ctx.reply = (text, extra = {}) => {
    if (typeof text === "string" && text.length > 0) {
      const monospacedText = `<code>${text}</code>`;

      // ❗ Главное изменение: добавляем parse_mode: 'HTML' в объект extra
      const options = {
        ...extra,
        parse_mode: "HTML" as ParseMode,
      };

      // Вызываем оригинальный метод с явным режимом разметки
      return originalReply(monospacedText, options);
    }
    return originalReply(text, extra);
  };

  return next();
});

/**
 * Главное меню с выбором дыхательных циклов.
 */

export function sendBreathingMenu(
  ctx: Context,
  userName: string,
  isNewUser: boolean = false
) {
  const greeting = isNewUser
    ? `🧘‍♂️ Добро пожаловать, ${userName}!\nЯ Reset Flow Bot, твой личный тренер по дыханию. Выбери практику, чтобы начать.`
    : `🧘‍♂️ С возвращением, ${userName}!\nВыбери практику, чтобы продолжить тренировку:`;

  // 🚀 ГЕНЕРАЦИЯ КНОПОК В ОДИН ПЛОСКИЙ МАССИВ
  const flatCycleButtons = CYCLES.map((cycle, index) => {
    const callbackData = `select_cycle_${index}`;
    // Возвращаем просто объект кнопки, а не массив с одной кнопкой
    return Markup.button.callback(cycle.name, callbackData);
  });

  ctx.reply(
    greeting,
    // 🚀 ИСПОЛЬЗУЕМ Markup.inlineKeyboard С ОПЦИЕЙ { columns: 2 }
    Markup.inlineKeyboard(flatCycleButtons, { columns: 2 })
  );
}

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
    const { isNewUser } = await findOrCreateUser(telegramUser.id, telegramUser);

    // 3. Отправляем меню дыхания
    sendBreathingMenu(ctx, telegramUser.first_name, isNewUser);
  } catch (error) {
    ctx.reply(
      "Произошла ошибка при обработке данных пользователя. Пожалуйста, попробуйте позже."
    );
  }
});

// // --- Обработчик для кнопок (Запуск тренажера) ---

bot.action(/^select_cycle_(\d+)$/, handleDurationMenu);
bot.action(/^start_cycle_(\d+)_(\d+)$/, handleBreathingCycleStart as any);
bot.action("back_to_main_menu", async (ctx: Context) => {
  await ctx.answerCbQuery("Возвращаемся к выбору практики...");

  // Удаляем кнопки из текущего сообщения
  try {
    await ctx.editMessageReplyMarkup(undefined);
  } catch (error) {
    console.error("Не удалось удалить кнопки (Меню продолжительности):", error);
  }

  // Снова вызываем функцию, которая отправляет основное меню выбора цикла
  // Здесь вам понадобится userName. Если у вас его нет в ctx,
  // возможно, придется получать его из ctx.from.first_name.
  const userName = ctx.from?.first_name || "Пользователь";
  sendBreathingMenu(ctx, userName);
});

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
  .catch((err: Error) => console.error("❌ Ошибка запуска бота:", err.message));

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
