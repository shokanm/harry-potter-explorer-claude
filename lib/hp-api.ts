import "server-only";

import type { RawCharacter } from "@/lib/types";

/**
 * Клиент внешнего Harry Potter API.
 *
 * Импорт "server-only" — не украшение: он превращает случайный импорт этого
 * модуля в клиентский компонент в ошибку сборки. Требование ТЗ «внешние сервисы
 * вызываются только с сервера» держится компилятором, а не дисциплиной.
 */

const BASE_URL = process.env.HP_API_BASE_URL ?? "https://hp-api.onrender.com/api";

/**
 * hp-api живёт на бесплатном тарифе Render и после простоя просыпается
 * 30–60 секунд. Ждать столько нельзя — лучше быстро упасть на снапшот,
 * чем показать пользователю крутилку на минуту.
 */
const TIMEOUT_MS = Number(process.env.HP_API_TIMEOUT_MS ?? 8000);

/** Данные меняются раз в никогда — час кэша ISR более чем достаточно. */
const REVALIDATE_SECONDS = Number(process.env.HP_API_REVALIDATE ?? 3600);

export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

async function getJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      throw new UpstreamError(`hp-api ответил ${response.status} на ${path}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new UpstreamError(`hp-api не ответил за ${TIMEOUT_MS} мс (${path})`, error);
    }
    // Разворачиваем причину: без неё в логах остаётся «недоступен»
    // без единого намёка на то, что именно случилось.
    const cause = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    const nested =
      error instanceof Error && error.cause instanceof Error
        ? ` ← ${error.cause.name}: ${error.cause.message}`
        : "";
    throw new UpstreamError(`hp-api недоступен (${path}): ${cause}${nested}`, error);
  } finally {
    clearTimeout(timer);
  }
}

export function fetchCharactersRaw(): Promise<RawCharacter[]> {
  return getJson<RawCharacter[]>("/characters");
}

export function fetchSpellsRaw(): Promise<{ id: string; name: string; description: string }[]> {
  return getJson<{ id: string; name: string; description: string }[]>("/spells");
}
