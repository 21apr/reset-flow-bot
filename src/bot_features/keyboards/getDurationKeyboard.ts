import { Context, Markup } from "telegraf";
import { CYCLES } from "../breathing/cycles";
import { formatAsCodeBlock } from "../../utils/format";

// --- Добавьте этот тип для избежания ошибки TypeScript (Property 'match') ---
type ExtendedActionContext = Context & {
  match: RegExpMatchArray;
  callbackQuery: any;
};
// --------------------------------------------------------------------------

// 💡 Набор стандартных продолжительностей (в секундах)
const AVAILABLE_DURATIONS = [60, 120, 180, 300]; // 1, 2, 3, 5 минут

export async function handleDurationMenu(ctx: ExtendedActionContext) {
  // 1. Извлекаем индекс цикла из колбэка
  const cycleIndex = parseInt(ctx.match[1]);

  if (cycleIndex >= CYCLES.length) {
    return ctx.answerCbQuery("❌ Неверный цикл.");
  }

  const cycle = CYCLES[cycleIndex];

  const cycleName = cycle.name.split(" ")[0];

  // 2. Отвечаем на callback и удаляем старые кнопки
  await ctx.answerCbQuery(
    `Выбран цикл "${cycleName}". Выберите продолжительность.`
  );
  try {
    await ctx.editMessageReplyMarkup(undefined);
  } catch (error) {
    console.error("Не удалось удалить кнопки (Меню выбора цикла):", error);
  }

  // 3. Генерируем кнопки выбора продолжительности
  const durationButtons = AVAILABLE_DURATIONS.map((duration) => {
    const minutes = duration / 60;

    // CALLBACK_DATA: start_cycle_ИНДЕКС_ПРОДОЛЖИТЕЛЬНОСТЬ
    // Этот формат соответствует вашему старому регулярному выражению!
    const callbackData = `start_cycle_${cycleIndex}_${duration}`;

    return Markup.button.callback(`${minutes} мин`, callbackData);
  });

  const backButton = Markup.button.callback("⬅️ Назад", "back_to_main_menu");

  // 🚀 ОБЪЕДИНЯЕМ КНОПКИ:
  // Мы хотим, чтобы кнопки продолжительности были в одном ряду, а "Назад" - в отдельном.
  // Markup.inlineKeyboard принимает массив массивов.
  // [durationButtons] - создает один ряд из всех кнопок продолжительности.
  // [backButton] - создает отдельный ряд для кнопки "Назад".
  const fullKeyboard = Markup.inlineKeyboard([
    durationButtons, // Все кнопки продолжительности в один ряд
    [backButton], // Кнопка "Назад" в отдельный ряд
  ]);

  const finalText = formatAsCodeBlock(
    `⏱️ ${cycle.name}.
    ${cycle.pattern}

    <b>${cycle.description}</b>

    Какую продолжительность вы выберете?`
  );

  // 4. Отправляем новое сообщение с меню продолжительности
  // (Используем reply, так как editMessageReplyMarkup удалил кнопки в старом сообщении)
  ctx.reply(finalText, fullKeyboard);
}
