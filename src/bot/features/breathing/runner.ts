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

const MOON_PHASES = ["🌕", "🌔", "🌓", "🌒", "🌑"];

const getProgressString = (
  completedCycles: number,
  totalCycles: number,
  currentPhaseIndex: number,
  totalPhases: number
): string => {
  const completedStars = "🌑".repeat(completedCycles);

  let currentCycleMoon = "";
  if (completedCycles < totalCycles) {
    let progressIndex: number;

    if (totalPhases === 3) {
      const mapForThreePhases = [0, 1, 3, 4];
      progressIndex = mapForThreePhases[Math.min(currentPhaseIndex, 3)];
    } else {
      progressIndex = Math.min(
        4,
        Math.floor((currentPhaseIndex / totalPhases) * 4)
      );
    }

    currentCycleMoon = MOON_PHASES[progressIndex];
  }

  const remainingDots = "🌕".repeat(
    Math.max(0, totalCycles - completedCycles - (currentCycleMoon ? 1 : 0))
  );

  return completedStars + currentCycleMoon + remainingDots;
};

export async function runBreathingCycle(
  ctx: MyContext,
  cycle: Cycle,
  totalDurationSeconds: number
): Promise<void> {
  const t = i18next.t.bind(i18next);
  if (!ctx.from) {
    console.error(
      t("error.sender_id_missing")
    );
    return;
  }

  const cycleName = t(cycle.nameKey);

  const cycleDuration = cycle.phases.reduce((sum, p) => sum + p.duration, 0);
  const totalCycles = Math.ceil(totalDurationSeconds / cycleDuration);
  const totalPhases = cycle.phases.length;

  let currentCycleCount = 0;
  let completedCycles = 0;

  let mainMessage = await ctx.reply(
    `🧘 ${t("message.preparing_exercise")}"${cycleName}"...`
  );
  await completeCallbackAction(
    ctx,
    `🧘 ${t("message.preparing_exercise")}"${cycleName}"...`
  );

  const mainMessageId = mainMessage.message_id;

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

  while (completedCycles < totalCycles) {
    currentCycleCount++;

    let completedPhasesInCurrentCycle = 0;

    for (const phase of cycle.phases) {
      if (completedCycles >= totalCycles) break;

      for (let i = 0; i <= phase.duration; i++) {
        const phaseProgress = "⬛".repeat(i) + "⬜️".repeat(phase.duration - i);

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
  completedPhasesInCurrentCycle,
  totalPhases
)}
          </code>`;

        await ctx.telegram
          .editMessageText(ctx.chat!.id, mainMessageId, undefined, statusText, {
            parse_mode: "HTML",
          })
          .catch((e) => {
            if (!e.message.includes("message is not modified")) {
              console.error(t("error.edit_message"), e.message);
            }
          });

        if (i < phase.duration) {
          await sleep(1000);
        }
      }
      completedPhasesInCurrentCycle++;
    }
    completedCycles++;
  }

  try {
    await addBreathingTime(String(ctx.from.id), totalDurationSeconds);
  } catch (error) {
    console.error(
      t("error.save_time").replace("{id}", String(ctx.from.id)),
      error
    );
  }

  let totalTimeEver = 0;
  totalTimeEver = await getUserTotalBreathingTime(String(ctx.from.id));

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

  await ctx.telegram.editMessageText(
    ctx.chat!.id,
    mainMessageId,
    undefined,
    finalStatsText,
    { parse_mode: "HTML" }
  );

  const userName = ctx.from?.first_name || t("placeholder.friend");
  const text = `
${t("message.great_job")}, ${userName}!
${t("message.select_new_practice")}
      `;

  await sendCycleMenu(ctx, text);
}
