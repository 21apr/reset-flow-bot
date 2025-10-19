import { Markup } from "telegraf";
// Предполагаемый импорт
import { CYCLES } from "./cycles";

/**
 * Генерирует и возвращает объект Inline-клавиатуры для выбора дыхательных циклов.
 * @returns {Markup.InlineKeyboardMarkup} Объект клавиатуры Telegraf.
 */
export function sendBreathingMenu(): ReturnType<typeof Markup.inlineKeyboard> {
  // 1. 🚀 ГЕНЕРАЦИЯ КНОПОК В ОДИН ПЛОСКИЙ МАССИВ
  const flatCycleButtons = CYCLES.map((cycle, index) => {
    const callbackData = `select_cycle_${index}`;
    // Создаем кнопку-коллбэк
    return Markup.button.callback(cycle.name, callbackData);
  });

  // 2. 🚀 ФОРМИРОВАНИЕ КЛАВИАТУРЫ И ЕЕ ВОЗВРАТ
  // Markup.inlineKeyboard возвращает объект, который готов для использования
  // в качестве опции 'reply_markup'.
  return Markup.inlineKeyboard(flatCycleButtons, { columns: 2 });
}
