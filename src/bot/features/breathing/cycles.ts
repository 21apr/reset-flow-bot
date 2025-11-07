import { Context } from "telegraf";
import { getTranslator } from "../../../shared/i18n/getTranslator";

// Тип, описывающий одну фазу цикла
export type BreathingPhase = "Вдох" | "Пауза_до" | "Выдох" | "Пауза_после"; // Эти типы лучше оставить на английском в коде, если это технические идентификаторы

// Интерфейс для хранения данных о конкретном цикле
export interface Cycle {
  nameKey: string; // Ключ для имени (Расслабление, Энергия и т.д.)
  pattern: string;
  descriptionKey: string; // Ключ для описания
  phases: {
    type: BreathingPhase;
    duration: number; // Длительность в секундах
    emoji: string;
    textKey: string; // Ключ для текста фазы (ВДОХ, ПАУЗА и т.д.)
  }[];
}

/**
 * Заложенные шаблоны дыхательных циклов (используют ключи i18n).
 */
export const CYCLES: Cycle[] = [
  {
    nameKey: "cycle.relaxation.name",
    pattern: "4-7-8",
    descriptionKey: "cycle.relaxation.description",
    phases: [
      { type: "Вдох", duration: 4, emoji: "⬆️", textKey: "phase.in_slow" },
      {
        type: "Пауза_до",
        duration: 7,
        emoji: "⏸️",
        textKey: "phase.hold_breath",
      },
      { type: "Выдох", duration: 8, emoji: "⬇️", textKey: "phase.out_smooth" },
    ],
  },
  {
    nameKey: "cycle.anxiety_relief.name",
    pattern: "4-0-6-0",
    descriptionKey: "cycle.anxiety_relief.description",
    phases: [
      { type: "Вдох", duration: 4, emoji: "⬆️", textKey: "phase.in_nose" },
      { type: "Выдох", duration: 6, emoji: "⬇️", textKey: "phase.out_mouth" },
    ],
  },
  {
    nameKey: "cycle.concentration.name",
    pattern: "4-4-4-4",
    descriptionKey: "cycle.concentration.description",
    phases: [
      { type: "Вдох", duration: 4, emoji: "⬆️", textKey: "phase.in" },
      { type: "Пауза_до", duration: 4, emoji: "⏸️", textKey: "phase.hold" },
      { type: "Выдох", duration: 4, emoji: "⬇️", textKey: "phase.out" },
      {
        type: "Пауза_после",
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
      { type: "Вдох", duration: 5, emoji: "⬆️", textKey: "phase.in" },
      { type: "Выдох", duration: 5, emoji: "⬇️", textKey: "phase.out" },
    ],
  },
  {
    nameKey: "cycle.energy.name",
    pattern: "1-0-1-0",
    descriptionKey: "cycle.energy.description",
    phases: [
      { type: "Выдох", duration: 1, emoji: "💨", textKey: "phase.out_sharp" },
      { type: "Вдох", duration: 1, emoji: "⬆️", textKey: "phase.in_passive" },
    ],
  },
  {
    nameKey: "cycle.irritation_release.name",
    pattern: "4-0-8-0",
    descriptionKey: "cycle.irritation_release.description",
    phases: [
      { type: "Вдох", duration: 4, emoji: "⬆️", textKey: "phase.in_nose" },
      { type: "Выдох", duration: 8, emoji: "🫧", textKey: "phase.out_sound" },
    ],
  },
  {
    nameKey: "cycle.creative_flow.name",
    pattern: "4-2-6-2",
    descriptionKey: "cycle.creative_flow.description",
    phases: [
      { type: "Вдох", duration: 4, emoji: "⬆️", textKey: "phase.in" },
      { type: "Пауза_до", duration: 2, emoji: "⏸️", textKey: "phase.hold_in" },
      { type: "Выдох", duration: 6, emoji: "⬇️", textKey: "phase.out" },
      {
        type: "Пауза_после",
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
