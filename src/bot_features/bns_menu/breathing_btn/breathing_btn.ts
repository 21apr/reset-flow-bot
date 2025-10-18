import { Context } from "telegraf";
import { CYCLES } from "../../breathing/cycles";
import { runBreathingCycle } from "../../breathing/runner";

type ExtendedActionContext = Context & { match: RegExpMatchArray };

// Универсальный обработчик для всех циклов
export async function handleBreathingCycleStart(ctx: ExtendedActionContext) {
  // 1. Извлекаем данные из callback-строки с помощью ctx.match
  // [0] - вся строка (start_cycle_1_120)
  // [1] - индекс цикла (1)
  // [2] - общая продолжительность в секундах (120)
  const cycleIndex = parseInt(ctx.match[1]);
  const totalDuration = parseInt(ctx.match[2]);

  // Проверка, что индекс существует в массиве CYCLES
  if (cycleIndex >= CYCLES.length) {
    return ctx.answerCbQuery("❌ Неверный цикл.");
  }

  const cycle = CYCLES[cycleIndex];
  const cycleName = cycle.name.split(" ")[0]; // Например, "4-4-4-4"

  // 2. Отвечаем на callback
  await ctx.answerCbQuery(`Начинаем практику "${cycleName}"...`);

  // 3. Удаляем кнопки
  try {
    // Чтобы избежать ошибки типизации, используйте {} и добавьте 'as any'
    // или используйте undefined, как вы делали.
    await ctx.editMessageReplyMarkup(undefined);
  } catch (error) {
    console.error("Не удалось удалить кнопки:", error);
  }

  // 4. Запускаем тренажер
  try {
    // Передаем извлеченные параметры
    runBreathingCycle(ctx, cycle, totalDuration);
  } catch (error) {
    console.error(`❌ Ошибка запуска тренажера (${cycleName}):`, error);
    ctx.reply("Произошла ошибка при выполнении упражнения. Попробуйте снова.");
  }
}
