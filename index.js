import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    'Привет! 🌊 Я Reset Flow Bot.\n' +
    'Хочешь немного восстановить энергию и вернуть поток?\n' +
    'Как ты себя чувствуешь сейчас?',
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

bot.launch();
console.log('Reset Flow Bot запущен 🚀');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
