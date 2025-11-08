import {
  completeCallbackAction,
  sendCycleMenu,
} from "../../utils/conversationTemplates";
import { sleep } from "../../utils/sleep";
import {
  addBreathingTime,
  getUserTotalBreathingTime,
} from "../../../db/mongoDB/service";
import { Cycle } from "./cycles";
import { MyContext } from "../general/types/types";
import i18next from "../../../shared/i18n/i18n";

// 5 лунных фаз для визуализации прогресса внутри цикла (от 0 до 4)
const MOON_PHASES = ["🌕", "🌔", "🌓", "🌒", "🌑"];

/**
 * Генерирует строку прогресса (например, [ "🌕","🌔", "🌓", "🌒", "🌑"]).
 *
 * Мы используем 5 эмодзи луны для отображения прогресса внутри текущего цикла
 * (от 🌕 в начале цикла до 🌑 в конце).
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
    let progressIndex: number;

    // --- ИСПРАВЛЕНИЕ ДЛЯ ТРЕХФАЗНЫХ ЦИКЛОВ ---
    if (totalPhases === 3) {
      // Желаемая последовательность: "🌕", "🌔", "🌒", "🌑"
      // Индексы: 0, 1, 3, 4
      // currentPhaseIndex: 0 -> 0 (🌕)
      // currentPhaseIndex: 1 -> 1 (🌔)
      // currentPhaseIndex: 2 -> 3 (🌒)
      // currentPhaseIndex: 3 -> 4 (🌑) (но цикл завершен, поэтому это не произойдет)
      const mapForThreePhases = [0, 1, 3, 4]; // Индексы MOON_PHASES для фаз 0, 1, 2, 3
      // Используем индекс 3 (4) для всех случаев, когда фаз > 2
      progressIndex = mapForThreePhases[Math.min(currentPhaseIndex, 3)];
    } else {
      // --- СТАНДАРТНАЯ ЛОГИКА ДЛЯ ВСЕХ ОСТАЛЬНЫХ ЦИКЛОВ ---
      // Вычисляем индекс эмодзи (от 0 до 4) на основе завершенных фаз.
      // Старая формула, которая работает для 2 и 4 фаз:
      progressIndex = Math.min(
        4,
        Math.floor((currentPhaseIndex / totalPhases) * 4)
      );
    }

    currentCycleMoon = MOON_PHASES[progressIndex];
  }

  // 3. Оставшиеся циклы: всегда 🌕.
  // ... (остальной код функции без изменений)
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
  ctx: MyContext,
  cycle: Cycle,
  totalDurationSeconds: number
): Promise<void> {
  const t = i18next.t.bind(i18next);
  // ПРОВЕРКА КОНТЕКСТА: Если нет отправителя, ничего не делаем и выходим.
  if (!ctx.from) {
    console.error(
      t("error.sender_id_missing") // Используем ключ
    );
    return;
  }

  // Получаем переведенное имя цикла для сообщений
  const cycleName = t(cycle.nameKey);

  // Вычисление параметров
  const cycleDuration = cycle.phases.reduce((sum, p) => sum + p.duration, 0);
  const totalCycles = Math.ceil(totalDurationSeconds / cycleDuration);
  const totalPhases = cycle.phases.length; // Общее количество фаз в цикле

  let currentCycleCount = 0; // Счетчик текущего цикла (начинается с 1)
  let completedCycles = 0; // Счетчик завершенных циклов (начинается с 0)

  // --- 1. Отправка и сохранение ID главного сообщения ---
  let mainMessage = await ctx.reply(
    `🧘 ${t("message.preparing_exercise")}"${cycleName}"...` // Используем ключ и имя
  );
  await completeCallbackAction(
    ctx,
    `🧘 ${t("message.preparing_exercise")}"${cycleName}"...` // Используем ключ и имя
  );

  const mainMessageId = mainMessage.message_id;

  // --- 2. ФАЗА: ОБРАТНЫЙ ОТСЧЕТ ---
  for (let i = 3; i > 0; i--) {
    await ctx.telegram.editMessageText(
      ctx.chat!.id,
      mainMessageId,
      undefined,
      `<code>${t("message.starting_in")}: ${i}</code>`,
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
      for (let i = 0; i <= phase.duration; i++) {
        // Прогресс фазы: ▓▓▓░░ (визуализация времени в фазе)
        const phaseProgress = "⬛".repeat(i) + "⬜️".repeat(phase.duration - i);

        // Формируем текст
        // Все строки теперь используют ключи (cycle.nameKey, phase.textKey)
        const statusText = `<code>
${cycleName}
---------------------------------
${phase.emoji} <b>${t(phase.textKey)}</b>:
${phase.duration - i} ${t("unit.sec")}.
${phaseProgress}
---------------------------------
${t("label.progress")}:
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
              console.error(t("error.edit_message"), e.message); // Используем ключ
            }
          });

        // Ждем 1 секунду ТОЛЬКО если это НЕ последняя итерация
        // i == phase.duration — это последняя итерация, где remainingTime = 0.
        if (i < phase.duration) {
          await sleep(1000);
        }
        // Если i == phase.duration, мы выходим из этого цикла for и сразу переходим
        // к обновлению completedPhasesInCurrentCycle и следующей фазе/циклу.
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
    console.error(
      t("error.save_time").replace("{id}", String(ctx.from.id)), // Используем ключ с заменой
      error
    );
  }

  // 2. Получение общего времени (для отображения статистики)
  let totalTimeEver = 0;
  totalTimeEver = await getUserTotalBreathingTime(String(ctx.from.id));

  // Формируем финальную статистику, используя ключи
  const totalMinutes = Math.floor(totalDurationSeconds / 60);
  const totalTimeMinutes = Math.floor(totalTimeEver / 60);

  const finalStatsText = `<code>✅ ${t(
    "message.exercise_complete"
  )}${cycleName}"!
---------------------------------
${t("stat.cycles_completed")}: <b>${totalCycles}</b>
${t("stat.total_duration")}: <b>${totalMinutes} ${t("unit.min")}.</b>
---------------------------------
🧘 ${t("stat.total_time_title")}:
${totalTimeMinutes} ${t("unit.min")}.
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
  const userName = ctx.from?.first_name || t("placeholder.friend"); // Используем ключ
  const text = `
${t("message.great_job")}, ${userName}!
${t("message.select_new_practice")}
      `;

  // Используем наш унифицированный шаблон, который отправит текст + кнопки
  await sendCycleMenu(ctx, text);
}
