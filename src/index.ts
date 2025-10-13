import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { Telegraf, Markup, Context } from "telegraf";
// import { message } from 'telegraf/filters'; // Для более точной типизации bot.on('text', ...)
import dotenv from "dotenv";
import { ITelegramUser } from "./mongoDB/interfaces/User.interface";
import { findOrCreateUser } from "./mongoDB/service";

// Загрузка переменных окружения
dotenv.config();

// 1. Проверка и типизация переменных окружения
// ---------------------------------------------

// Проверяем наличие критически важных переменных и присваиваем им тип string.
// Если переменная отсутствует, выбрасываем ошибку для немедленного останова.

const MONGODB_TOKEN: string | undefined = process.env.MONGODB_TOKEN;
if (!MONGODB_TOKEN) {
  throw new Error("❌ MONGODB_TOKEN не найден в переменных окружения.");
}

const BOT_TOKEN: string | undefined = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("❌ BOT_TOKEN не найден в переменных окружения.");
}

const RENDER_URL: string | undefined = process.env.RENDER_URL;
// RENDER_URL не критичен для запуска, но нужен для пинга
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
    // Указываем, что ошибка имеет тип Error
    console.error("❌ Ошибка подключения к MongoDB:", err.message);
    // Не останавливаем программу, чтобы дать возможность работать хотя бы Express-серверу
  });

// 3. Инициализация бота и сервера
// ---------------------------------------------

// Создаем экземпляр бота
const bot = new Telegraf<Context>(BOT_TOKEN);
// Context - базовый тип контекста Telegraf

// Создаем экземпляр Express-сервера
const app = express();

// 4. Логика бота
// ---------------------------------------------

// bot.start((ctx) => {
//   // Используем ctx.reply с обязательной типизацией Markup.keyboard
//   const keyboard = Markup.keyboard([
//     ["😌 Спокойно", "😩 Устал"],
//     ["😠 Напряжён", "⚡ Вдохновлён"],
//   ]).resize();

//   ctx.reply(
//     "Привет! 🌊 Я Reset Flow Bot.\nКак ты себя чувствуешь сейчас?",
//     keyboard
//   );
// });
bot.start(async (ctx) => {
  // 1. Получаем данные пользователя
  const telegramUser: ITelegramUser = {
    id: String(ctx.from.id),
    username: ctx.from.username,
    first_name: ctx.from.first_name || "друг",
  };

  try {
    // 2. Вызываем функцию Find or Create
    const { user, isNewUser } = await findOrCreateUser(
      telegramUser.id,
      telegramUser
    );

    // 3. Логика ответа бота с проверкой isNewUser
    const userName = user.firstName || "друг";

    const replyText = isNewUser
      ? `👋 Добро пожаловать, ${userName}! Рады видеть нового пользователя. Начнем знакомство.`
      : `С возвращением, ${userName}! Кажется, ты уже знаешь, что делать.`;

    ctx.reply(
      replyText + "\nКак ты себя чувствуешь сейчас?",
      Markup.keyboard([
        ["😌 Спокойно", "😩 Устал"],
        ["😠 Напряжён", "⚡ Вдохновлён"],
      ]).resize()
    );
  } catch (error) {
    ctx.reply(
      "Произошла ошибка при регистрации. Пожалуйста, попробуйте позже."
    );
  }
});

// bot.hears - это частный случай bot.on('text')
bot.hears("😌 Спокойно", (ctx) =>
  ctx.reply(
    "Отлично! Попробуй закрепить это состояние — сделай три глубоких вдоха и улыбнись 🙂"
  )
);

bot.hears("😩 Устал", (ctx) =>
  ctx.reply(
    "Попробуй минуту просто посидеть, закрыв глаза. Пусть мысли идут как облака ☁️"
  )
);

bot.hears("😠 Напряжён", (ctx) =>
  ctx.reply(
    "Сожми кулаки, посчитай до пяти и отпусти. Пусть уйдёт всё лишнее 💨"
  )
);

bot.hears("⚡ Вдохновлён", (ctx) =>
  ctx.reply(
    "Поймай волну! Подумай, чему хочешь посвятить этот прилив энергии ⚡"
  )
);

// 5. Настройка Express-сервера
// ---------------------------------------------

// Явно типизируем req и res для Express
app.get("/", (req: Request, res: Response) => {
  res.send("Reset Flow Bot работает 🌊");
});

// 6. Запуск сервера и бота
// ---------------------------------------------

// Запускаем бот
bot
  .launch()
  .then(() => console.log("🚀 Reset Flow Bot запущен"))
  .catch((err: Error) => console.error("❌ Ошибка запуска бота:", err.message));

// Функция пинга для Render
if (RENDER_URL) {
  // В Node.js fetch доступен, но если у вас старая версия, возможно, нужно установить 'node-fetch'
  setInterval(() => {
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
