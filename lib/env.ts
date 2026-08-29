/**
 * Чтение переменных окружения.
 *
 * Обычное `process.env.X ?? "запасное"` здесь ошибочно: `??` подставляет
 * запасное значение только для undefined, а панели вроде Vercel сплошь и рядом
 * отдают переменную, **заданную пустой строкой**. В этом случае `??` пропускает
 * пустоту дальше, и приложение получает не запасной адрес, а `""` — с чем
 * `fetch("" + "/characters")` падает на «Invalid URL».
 *
 * Именно так боевой стенд молча ушёл на снапшот при живом hp-api.
 * Поэтому здесь пустая и пробельная строка считаются отсутствием значения.
 */

export function envStr(name: string, fallback: string): string {
  const raw = process.env[name];
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/** То же для чисел: `Number("")` даёт 0, что тихо ломает таймауты и лимиты. */
export function envNum(name: string, fallback: number): number {
  const raw = process.env[name];
  if (typeof raw !== "string" || raw.trim().length === 0) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Задана ли переменная по-настоящему (не пустой строкой). */
export function envSet(name: string): boolean {
  const raw = process.env[name];
  return typeof raw === "string" && raw.trim().length > 0;
}

export function envOrNull(name: string): string | null {
  const raw = process.env[name];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}
