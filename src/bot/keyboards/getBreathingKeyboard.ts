import { Markup } from "telegraf";
import { CYCLES } from "../features/breathing/cycles";
import { TFunction } from "i18next";

export function sendBreathingMenu(
  t: TFunction
): ReturnType<typeof Markup.inlineKeyboard> {
  const flatCycleButtons = CYCLES.map((cycle, index) => {
    const callbackData = `select_cycle_${index}`;
    const buttonText = t(cycle.nameKey);
    return Markup.button.callback(buttonText, callbackData);
  });

  return Markup.inlineKeyboard(flatCycleButtons, { columns: 2 });
}
