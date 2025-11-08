/**
 * Асинхронная функция для задержки выполнения.
 * @param ms - время задержки в миллисекундах.
 */
export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
