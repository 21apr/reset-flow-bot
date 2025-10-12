import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// --- Бот логика ---
bot.start((ctx) => {
  ctx.reply(
    'Привет! 🌊 Я Reset Flow Bot.\nКак ты себя чувствуешь сейчас?',
    Markup.keyboard([
      ['😌 Спокойно', '😩 Устал'],
      ['😠 Напряжён', '⚡ Вдохновлён']
    ]).resize()
  );
});

bot.hears('😌 Спокойно', (ctx) =>
  ctx.reply('Отлично! Попробуй закрепить это состояние — сделай три глубоких вдоха и улыбнись 🙂')
);

bot.hears('😩 Устал', (ctx) =>
  ctx.reply('Попробуй минуту просто посидеть, закрыв глаза. Пусть мысли идут как облака ☁️')
);

bot.hears('😠 Напряжён', (ctx) =>
  ctx.reply('Сожми кулаки, посчитай до пяти и отпусти. Пусть уйдёт всё лишнее 💨')
);

bot.hears('⚡ Вдохновлён', (ctx) =>
  ctx.reply('Поймай волну! Подумай, чему хочешь посвятить этот прилив энергии ⚡')
);

// --- Express сервер для Render ---
app.get('/', (req, res) => {
  res.send('Reset Flow Bot работает 🌊');
});

// --- Запускаем бот ---
bot.launch();
console.log('Reset Flow Bot запущен 🚀');

// --- Пинг каждые 14 минут ---
const URL = process.env.RENDER_URL; // добавим в .env URL проекта
setInterval(() => {
  fetch(URL).then(() => console.log('🌐 Ping sent to keep alive'));
}, 14 * 60 * 1000);

// --- Запускаем веб-сервер ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
