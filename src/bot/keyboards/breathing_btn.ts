import { CYCLES } from "../features/breathing/cycles";
import { runBreathingCycle } from "../features/breathing/runner";
import { MyContext } from "../features/general/types/types";

type ExtendedActionContext = MyContext & { match: RegExpMatchArray };

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
  const cycleName = cycle.nameKey.split(" ")[0]; // Например, "4-4-4-4"

  // 2. Отвечаем на callback
  await ctx.answerCbQuery(`Начинаем практику "${cycleName}"...`);

  // 4. Запускаем тренажер
  try {
    // Передаем извлеченные параметры
    runBreathingCycle(ctx, cycle, totalDuration);
  } catch (error) {
    console.error(`❌ Ошибка запуска тренажера (${cycleName}):`, error);
    ctx.reply("Произошла ошибка при выполнении упражнения. Попробуйте снова.");
  }
}
