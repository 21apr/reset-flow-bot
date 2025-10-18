// Тип, описывающий одну фазу цикла
export type BreathingPhase = "Вдох" | "Пауза_до" | "Выдох" | "Пауза_после";

// Интерфейс для хранения данных о конкретном цикле
export interface Cycle {
  name: string;
  pattern: string;
  description: string; // Короткое описание цели цикла
  phases: {
    type: BreathingPhase;
    duration: number; // Длительность в секундах
    emoji: string;
    text: string;
  }[];
}

/**
 * Заложенные шаблоны дыхательных циклов.
 */
export const CYCLES: Cycle[] = [
  {
    name: "Расслабление",
    pattern: "4-7-8",
    description:
      "Помогает уснуть, снижает тревожность, успокаивает нервную систему.",
    phases: [
      { type: "Вдох", duration: 4, emoji: "⬆️", text: "ВДОХ (медленно)" },
      {
        type: "Пауза_до",
        duration: 7,
        emoji: "⏸️",
        text: "ПАУЗА (держим дыхание)",
      },
      { type: "Выдох", duration: 8, emoji: "⬇️", text: "ВЫДОХ (очень плавно)" },
    ],
  },
  {
    name: "Снятие тревоги",
    pattern: "4-0-6-0",
    description:
      "Выдох длиннее вдоха — стабилизирует дыхание и снижает стресс.",
    phases: [
      { type: "Вдох", duration: 4, emoji: "⬆️", text: "ВДОХ (через нос)" },
      {
        type: "Выдох",
        duration: 6,
        emoji: "⬇️",
        text: "ВЫДОХ (через рот, медленно)",
      },
    ],
  },
  {
    name: "Концентрация",
    pattern: "4-4-4-4",
    description:
      "«Квадратное дыхание» — помогает сосредоточиться и сохранять спокойствие.",
    phases: [
      { type: "Вдох", duration: 4, emoji: "⬆️", text: "ВДОХ" },
      { type: "Пауза_до", duration: 4, emoji: "⏸️", text: "ПАУЗА (держим)" },
      { type: "Выдох", duration: 4, emoji: "⬇️", text: "ВЫДОХ" },
      { type: "Пауза_после", duration: 4, emoji: "⏸️", text: "ПАУЗА (покой)" },
    ],
  },
  {
    name: "Баланс",
    pattern: "5-0-5-0",
    description:
      "Ровное дыхание — гармонизирует сердце и мозг, стабилизирует ритм.",
    phases: [
      { type: "Вдох", duration: 5, emoji: "⬆️", text: "ВДОХ" },
      { type: "Выдох", duration: 5, emoji: "⬇️", text: "ВЫДОХ" },
    ],
  },
  {
    name: "Энергия",
    pattern: "1-0-1-0",
    description:
      "Короткие активные выдохи — активируют тело и проясняют сознание.",
    phases: [
      {
        type: "Выдох",
        duration: 1,
        emoji: "💨",
        text: "ВЫДОХ (резко через нос)",
      },
      { type: "Вдох", duration: 1, emoji: "⬆️", text: "ВДОХ (пассивно)" },
    ],
  },
  {
    name: "Сброс раздражения",
    pattern: "4-0-8-0",
    description:
      "Помогает избавиться от гнева — длинный выдох с мягким звуком.",
    phases: [
      { type: "Вдох", duration: 4, emoji: "⬆️", text: "ВДОХ (через нос)" },
      {
        type: "Выдох",
        duration: 8,
        emoji: "🫧",
        text: "ВЫДОХ (со звуком 'хааа')",
      },
    ],
  },
  {
    name: "Творческий поток",
    pattern: "4-2-6-2",
    description:
      "Мягкий ритм для состояния потока — поддерживает внимание без напряжения.",
    phases: [
      { type: "Вдох", duration: 4, emoji: "⬆️", text: "ВДОХ" },
      { type: "Пауза_до", duration: 2, emoji: "⏸️", text: "ПАУЗА (на вдохе)" },
      { type: "Выдох", duration: 6, emoji: "⬇️", text: "ВЫДОХ" },
      { type: "Пауза_после", duration: 2, emoji: "⏸️", text: "ПАУЗА (отдых)" },
    ],
  },
];
