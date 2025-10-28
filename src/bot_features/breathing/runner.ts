import { Context } from "telegraf";
import { sleep } from "../utils/sleep";
import { Cycle } from "./cycles";
import {
  addBreathingTime,
  getUserTotalBreathingTime,
} from "../../mongoDB/service";
import { formatAsCodeBlock } from "../../utils/format";
import {
  completeCallbackAction,
  sendCycleMenu,
} from "../utils/conversationTemplates";

// 5 лунных фаз для визуализации прогресса внутри цикла (от 0 до 4)
const MOON_PHASES = ["🌕", "🌔", "🌓", "🌒", "🌑"];

/**
 * Генерирует строку прогресса (например, [ "🌕", "🌖", "🌗", "🌘", "🌑"🌒
 ]).
 *
 * Мы используем 5 эмодзи луны для отображения прогресса внутри текущего цикла
 * (от 🌑 в начале цикла до 🌕 в конце).
 *
 * @param completedCycles - Количество полностью завершенных циклов.
 * @param totalCycles - Общее количество запланированных циклов.
 * @param currentPhaseIndex - Количество завершенных фаз в текущем цикле (от 0 до totalPhases).
 * @param totalPhases - Общее количество фаз в цикле.
 */
const getProgressString = (
  completedCycles: number,
  totalCycles: number,
  currentPhaseIndex: number,
  totalPhases: number
): string => {
  // 1. Завершенные циклы: всегда 🌑
  const completedStars = "🌑".repeat(completedCycles);

  // 2. Текущий цикл: его прогресс
  let currentCycleMoon = "";
  if (completedCycles < totalCycles) {
    // Вычисляем индекс эмодзи (от 0 до 4) на основе завершенных фаз.
    // Если totalPhases = 4:
    // 0 фаз завершено -> 0/4*4 = 0 (🌑)
    // 1 фаза завершена -> 1/4*4 = 1 (🌘)
    // 4 фазы завершено -> 4/4*4 = 4 (🌕)
    const progressIndex = Math.min(
      4,
      Math.floor((currentPhaseIndex / totalPhases) * 4)
    );
    currentCycleMoon = MOON_PHASES[progressIndex];
  }

  // 3. Оставшиеся циклы: всегда 🌕.
  // Вычитаем 1, если текущий цикл уже отображается (currentCycleMoon не пуст).
  const remainingDots = "🌕".repeat(
    Math.max(0, totalCycles - completedCycles - (currentCycleMoon ? 1 : 0))
  );

  return completedStars + currentCycleMoon + remainingDots;
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
  const totalPhases = cycle.phases.length; // Общее количество фаз в цикле

  let currentCycleCount = 0; // Счетчик текущего цикла (начинается с 1)
  let completedCycles = 0; // Счетчик завершенных циклов (начинается с 0)

  // --- 1. Отправка и сохранение ID главного сообщения ---
  let mainMessage = await ctx.reply(
    `🧘 Готовимся к упражнению "${cycle.name}"...`
  );
  await completeCallbackAction(
    ctx,
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

    // !!! НОВОЕ: Отслеживание числа ЗАВЕРШЕННЫХ фаз для визуализации луны.
    // Начинается с 0 (ни одна фаза не завершена, луна 🌑).
    let completedPhasesInCurrentCycle = 0;

    // Итерация по фазам цикла (Вдох, Пауза, Выдох...)
    for (const phase of cycle.phases) {
      // Если все циклы завершены, прерываем фазы
      if (completedCycles >= totalCycles) break;

      // Запускаем таймер фазы
      for (let i = 0; i < phase.duration; i++) {
        // Прогресс фазы: ▓▓▓░░ (визуализация времени в фазе)
        const phaseProgress =
          "⬛".repeat(i + 1) + "⬜️".repeat(phase.duration - (i + 1));

        // Формируем текст
        const statusText = `<code>
${cycle.name}
---------------------------------
${phase.emoji} <b>${phase.text}</b>:
${phase.duration - i} сек.
${phaseProgress}
---------------------------------
Прогресс:
${getProgressString(
  completedCycles,
  totalCycles,
  completedPhasesInCurrentCycle, // Используем количество завершенных фаз
  totalPhases
)}
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
      // !!! НОВОЕ: Фаза завершена, увеличиваем счетчик завершенных фаз.
      // При следующей итерации `getProgressString` луна продвинется.
      completedPhasesInCurrentCycle++;
    }
    completedCycles++; // Увеличиваем счетчик полностью завершенных циклов
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

  // ОТПРАВЛЯЕМ НОВОЕ СООБЩЕНИЕ с меню циклов
  const userName = ctx.from?.first_name || "друг";
  const text = `
  Отличная работа, ${userName}!
  Когда будет необходимо, выбери новую дыхательную практику:
      `;

  // Используем наш унифицированный шаблон, который отправит текст + кнопки
  await sendCycleMenu(ctx, text);
}
