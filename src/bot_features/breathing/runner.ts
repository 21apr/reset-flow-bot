import { Context } from "telegraf";
import { sleep } from "../utils/sleep";
import { Cycle } from "./cycles";
import {
  addBreathingTime,
  getUserTotalBreathingTime,
} from "../../mongoDB/service";
import { formatAsCodeBlock } from "../../utils/format";

/**
 * Генерирует строку прогресса (например, [ 🌑🌘🌗🌖🌕 ]).
 */
const getProgressString = (completed: number, totalCycles: number): string => {
  const totalVisible = Math.min(totalCycles);
  const completedStars = "🌕".repeat(Math.min(completed, totalVisible));
  const remainingDots = "🌑".repeat(Math.max(0, totalVisible - completed));
  // const ellipsis = totalCycles;
  return `${completedStars}${remainingDots}`;
};

/**
 * Запускает дыхательный цикл, используя редактирование одного сообщения.
 * @param ctx - Контекст Telegraf.
 * @param cycle - Выбранный цикл дыхания.
 * @param totalDurationSeconds - Общая продолжительность упражнения в секундах.
 */
export async function runBreathingCycle(
  ctx: Context,
  cycle: Cycle,
  totalDurationSeconds: number
): Promise<void> {
  // ПРОВЕРКА КОНТЕКСТА: Если нет отправителя, ничего не делаем и выходим.
  if (!ctx.from) {
    console.error(
      "❌ runBreathingCycle: Не удалось получить ID отправителя (ctx.from)."
    );
    return;
  }

  // Вычисление параметров
  const cycleDuration = cycle.phases.reduce((sum, p) => sum + p.duration, 0);
  const totalCycles = Math.ceil(totalDurationSeconds / cycleDuration);

  let currentCycleCount = 0; // Счетчик текущего цикла (начинается с 1)
  let completedCycles = 0; // Счетчик завершенных циклов (начинается с 0)

  // --- 1. Отправка и сохранение ID главного сообщения ---
  let mainMessage = await ctx.reply(
    `🧘 Готовимся к упражнению "${cycle.name}"...`
  );
  const mainMessageId = mainMessage.message_id;

  // --- 2. ФАЗА: ОБРАТНЫЙ ОТСЧЕТ ---
  for (let i = 3; i > 0; i--) {
    await ctx.telegram.editMessageText(
      ctx.chat!.id,
      mainMessageId,
      undefined,
      formatAsCodeBlock(`Начинаем через: ${i}`),
      { parse_mode: "HTML" }
    );
    await sleep(1000);
  }

  // --- 3. ФАЗА: ВЫПОЛНЕНИЕ ЦИКЛОВ ---

  // Цикл будет продолжаться, пока не завершится последний запланированный цикл.
  while (completedCycles < totalCycles) {
    currentCycleCount++;

    // Итерация по фазам цикла (Вдох, Пауза, Выдох...)
    for (const phase of cycle.phases) {
      // Если все циклы завершены, прерываем фазы
      if (completedCycles >= totalCycles) break;

      // Запускаем таймер фазы
      for (let i = 0; i < phase.duration; i++) {
        // Прогресс фазы: ▓▓▓░░ (визуализация времени в фазе)
        const phaseProgress =
          "🟦".repeat(i + 1) + "⬜️".repeat(phase.duration - (i + 1));

        // Формируем текст
        const statusText = `<code>${
          cycle.name
        } (Цикл ${currentCycleCount} из ${totalCycles})
---------------------------------
${phase.emoji} <b>${phase.text}</b>:
${phase.duration - i - 1} сек.
${phaseProgress}
---------------------------------
Прогресс:
${getProgressString(completedCycles, totalCycles)}
                </code>`;

        // Редактируем сообщение
        await ctx.telegram
          .editMessageText(ctx.chat!.id, mainMessageId, undefined, statusText, {
            parse_mode: "HTML",
          })
          .catch((e) => {
            // Молча игнорируем ошибку, если пользователь удалил сообщение
            if (!e.message.includes("message is not modified")) {
              console.error("Ошибка редактирования сообщения:", e.message);
            }
          });

        // Ждем 1 секунду
        await sleep(1000);
      }
    }
    completedCycles++; // Увеличиваем счетчик завершенных циклов
  }

  // --- 4. ФАЗА: ЗАВЕРШЕНИЕ И СТАТИСТИКА ---

  try {
    // Сохраняем "надышанное" время для пользователя
    await addBreathingTime(String(ctx.from.id), totalDurationSeconds);
  } catch (error) {
    console.error(`❌ Ошибка сохранения времени для ID ${ctx.from.id}:`, error);
  }

  // 2. Получение общего времени (для отображения статистики)
  let totalTimeEver = 0;
  totalTimeEver = await getUserTotalBreathingTime(String(ctx.from.id));

  const finalStatsText = `<code>✅ Упражнение "${cycle.name}" завершено!
---------------------------------
Выполнено циклов: <b>${totalCycles}</b>
Общее время упражнения: <b>${Math.floor(totalDurationSeconds / 60)} мин.</b>
---------------------------------
🧘 Общее время дыхания с ботом:
${Math.floor(totalTimeEver / 60)} мин.
    </code>`;

  // Редактируем сообщение с финальной статистикой
  await ctx.telegram.editMessageText(
    ctx.chat!.id,
    mainMessageId,
    undefined,
    finalStatsText,
    { parse_mode: "HTML" }
  );
}
