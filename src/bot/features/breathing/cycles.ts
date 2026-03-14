import { Context } from "telegraf";
import { getTranslator } from "../../../shared/i18n/getTranslator";

export type BreathingPhase = "In" | "Hold_In" | "Out" | "Hold_Out";

export interface Cycle {
  nameKey: string;
  pattern: string;
  descriptionKey: string;
  phases: {
    type: BreathingPhase;
    duration: number;
    emoji: string;
    textKey: string;
  }[];
}
export const CYCLES: Cycle[] = [
  {
    nameKey: "cycle.relaxation.name",
    pattern: "4-7-8",
    descriptionKey: "cycle.relaxation.description",
    phases: [
      { type: "In", duration: 4, emoji: "⬆️", textKey: "phase.in_slow" },
      {
        type: "Hold_In",
        duration: 7,
        emoji: "⏸️",
        textKey: "phase.hold_breath",
      },
      { type: "Out", duration: 8, emoji: "⬇️", textKey: "phase.out_smooth" },
    ],
  },
  {
    nameKey: "cycle.anxiety_relief.name",
    pattern: "4-0-6-0",
    descriptionKey: "cycle.anxiety_relief.description",
    phases: [
      { type: "In", duration: 4, emoji: "⬆️", textKey: "phase.in_nose" },
      { type: "Out", duration: 6, emoji: "⬇️", textKey: "phase.out_mouth" },
    ],
  },
  {
    nameKey: "cycle.concentration.name",
    pattern: "4-4-4-4",
    descriptionKey: "cycle.concentration.description",
    phases: [
      { type: "In", duration: 4, emoji: "⬆️", textKey: "phase.in" },
      { type: "Hold_In", duration: 4, emoji: "⏸️", textKey: "phase.hold" },
      { type: "Out", duration: 4, emoji: "⬇️", textKey: "phase.out" },
      {
        type: "Hold_Out",
        duration: 4,
        emoji: "⏸️",
        textKey: "phase.pause_rest",
      },
    ],
  },
  {
    nameKey: "cycle.balance.name",
    pattern: "5-0-5-0",
    descriptionKey: "cycle.balance.description",
    phases: [
      { type: "In", duration: 5, emoji: "⬆️", textKey: "phase.in" },
      { type: "Out", duration: 5, emoji: "⬇️", textKey: "phase.out" },
    ],
  },
  {
    nameKey: "cycle.energy.name",
    pattern: "1-0-1-0",
    descriptionKey: "cycle.energy.description",
    phases: [
      { type: "Out", duration: 1, emoji: "💨", textKey: "phase.out_sharp" },
      { type: "In", duration: 1, emoji: "⬆️", textKey: "phase.in_passive" },
    ],
  },
  {
    nameKey: "cycle.irritation_release.name",
    pattern: "4-0-8-0",
    descriptionKey: "cycle.irritation_release.description",
    phases: [
      { type: "In", duration: 4, emoji: "⬆️", textKey: "phase.in_nose" },
      { type: "Out", duration: 8, emoji: "🫧", textKey: "phase.out_sound" },
    ],
  },
  {
    nameKey: "cycle.creative_flow.name",
    pattern: "4-2-6-2",
    descriptionKey: "cycle.creative_flow.description",
    phases: [
      { type: "In", duration: 4, emoji: "⬆️", textKey: "phase.in" },
      { type: "Hold_In", duration: 2, emoji: "⏸️", textKey: "phase.hold_in" },
      { type: "Out", duration: 6, emoji: "⬇️", textKey: "phase.out" },
      {
        type: "Hold_Out",
        duration: 2,
        emoji: "⏸️",
        textKey: "phase.pause_rest",
      },
    ],
  },
];

export function getLocalizedCycles(ctx: Context) {
  const t = getTranslator(ctx);

  return CYCLES.map((cycle) => ({
    name: t(cycle.nameKey),
    description: t(cycle.descriptionKey),
    pattern: cycle.pattern,
    phases: cycle.phases.map((phase) => ({
      type: phase.type,
      duration: phase.duration,
      emoji: phase.emoji,
      text: t(phase.textKey),
    })),
  }));
}
