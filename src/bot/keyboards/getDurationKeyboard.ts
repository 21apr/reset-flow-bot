import { Markup } from "telegraf";
import { completeCallbackAction } from "../utils/conversationTemplates";
import { CYCLES } from "../features/breathing/cycles";
import { MyContext } from "../features/general/types/types";
import i18next from "../../shared/i18n/i18n";

type ExtendedActionContext = MyContext & {
  match: RegExpMatchArray;
  callbackQuery: any;
};

const AVAILABLE_DURATIONS = [60, 120, 180, 300];

export async function handleDurationMenu(ctx: ExtendedActionContext) {
  const t = i18next.t.bind(i18next);
  const cycleIndex = parseInt(ctx.match[1]);

  if (cycleIndex >= CYCLES.length) {
    return ctx.answerCbQuery("❌ Invalid cycle.");
  }

  const cycle = CYCLES[cycleIndex];

  const translatedCycleName = t(cycle.nameKey);

  const durationButtons = AVAILABLE_DURATIONS.map((duration) => {
    const minutes = duration / 60;
    const callbackData = `start_cycle_${cycleIndex}_${duration}`;
    const buttonText = t("menu.duration_minutes", { count: minutes });

    return Markup.button.callback(buttonText, callbackData);
  });

  const backButton = Markup.button.callback(
    t("button.back"),
    "back_to_main_menu"
  );

  const fullKeyboard = Markup.inlineKeyboard([
    durationButtons,
    [backButton],
  ]);

  const finalText = t("menu.duration_prompt", {
    cycleName: translatedCycleName,
    pattern: cycle.pattern,
    description: t(cycle.descriptionKey),
  });

  ctx.reply(finalText, fullKeyboard);

  await completeCallbackAction(
    ctx,
    t("message.cycle_selected", {
      cycleName: translatedCycleName,
      replace: translatedCycleName,
    })
  );
}
