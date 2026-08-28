import "server-only";

import type { HouseSlug } from "@/lib/content/houses";
import { isSupabaseConfigured, supabaseAdmin, supabaseRead } from "@/lib/supabase/server";

/**
 * Общий счёт распределений.
 *
 * Основное хранилище — Supabase: только так счётчик становится общим для всех
 * посетителей и обновляется живьём. Но приложение обязано работать и без него
 * (локальная разработка, деплой без ключей), поэтому есть запасной счётчик
 * в памяти процесса. Он честно помечен как ephemeral: при перезапуске
 * обнуляется, и интерфейс об этом говорит.
 */

export interface SortingTally {
  total: number;
  byHouse: Record<HouseSlug, number>;
  /** true — счёт общий и переживёт перезапуск; false — только в памяти этого процесса. */
  persistent: boolean;
  updatedAt: string;
}

const EMPTY: Record<HouseSlug, number> = {
  gryffindor: 0,
  slytherin: 0,
  ravenclaw: 0,
  hufflepuff: 0,
};

const memoryTally: Record<HouseSlug, number> = { ...EMPTY };

function fromMemory(): SortingTally {
  return {
    total: Object.values(memoryTally).reduce((a, b) => a + b, 0),
    byHouse: { ...memoryTally },
    persistent: false,
    updatedAt: new Date().toISOString(),
  };
}

export async function readSortingTally(): Promise<SortingTally> {
  if (!isSupabaseConfigured()) return fromMemory();

  const client = supabaseRead();
  if (!client) return fromMemory();

  try {
    const { data, error } = await client.from("sorting_results").select("house");
    if (error || !data) return fromMemory();

    const byHouse = { ...EMPTY };
    for (const row of data as { house: HouseSlug }[]) {
      if (row.house in byHouse) byHouse[row.house] += 1;
    }

    return {
      total: data.length,
      byHouse,
      persistent: true,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return fromMemory();
  }
}

/** Записывает результат. Возвращает true, если он попал в общее хранилище. */
export async function recordSorting(house: HouseSlug): Promise<boolean> {
  const client = supabaseAdmin();
  if (!client) {
    memoryTally[house] += 1;
    return false;
  }

  try {
    const { error } = await client.from("sorting_results").insert({ house });
    if (error) {
      memoryTally[house] += 1;
      return false;
    }
    return true;
  } catch {
    memoryTally[house] += 1;
    return false;
  }
}
