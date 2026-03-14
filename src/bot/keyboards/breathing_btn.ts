import { CYCLES } from "../features/breathing/cycles";
import { runBreathingCycle } from "../features/breathing/runner";
import { MyContext } from "../features/general/types/types";

type ExtendedActionContext = MyContext & { match: RegExpMatchArray };

export async function handleBreathingCycleStart(ctx: ExtendedActionContext) {
  const cycleIndex = Number.parseInt(ctx.match[1]);
  const totalDuration = Number.parseInt(ctx.match[2]);

  if (cycleIndex >= CYCLES.length) {
    return ctx.answerCbQuery("❌ Invalid cycle.");
  }

  const cycle = CYCLES[cycleIndex];
  const cycleName = cycle.nameKey.split(" ")[0];

  await ctx.answerCbQuery(`Starting practice "${cycleName}"...`);

  try {
    runBreathingCycle(ctx, cycle, totalDuration);
  } catch (error) {
    console.error(`❌ Error starting runner (${cycleName}):`, error);
    ctx.reply("Error during exercise. Please try again.");
  }
}
