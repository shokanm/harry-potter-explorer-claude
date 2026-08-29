import "server-only";

import charactersSnapshot from "@/data/characters.snapshot.json";
import spellsSnapshot from "@/data/spells.snapshot.json";
import { envNum } from "@/lib/env";
import { fetchCharactersRaw, fetchSpellsRaw } from "@/lib/hp-api";
import { normalizeCharacters, normalizeSpells } from "@/lib/normalize";
import { isSupabaseConfigured, supabaseRead } from "@/lib/supabase/server";
import type { Character, DataSourceLayer, RawCharacter, Spell } from "@/lib/types";

/**
 * Единственная точка чтения данных в приложении.
 *
 * Источник трёхслойный, слои пробуются по порядку:
 *
 *   1. Supabase   — зеркало, залитое scripts/sync.ts. Быстро и всегда живо.
 *   2. hp-api     — первоисточник. Живёт на бесплатном Render и просыпается
 *                   до минуты, поэтому он второй, а не первый.
 *   3. Снапшот    — сырые данные, закоммиченные в репозиторий.
 *                   Работает даже без сети.
 *
 * Смысл не в академической красоте: демо-стенд конкурса откроет незнакомый
 * человек в незнакомый момент, и он не должен увидеть пустой экран из-за того,
 * что чужой бесплатный хостинг решил поспать.
 */

interface Cached<T> {
  data: T;
  source: DataSourceLayer;
  expiresAt: number;
}

/** Кэш в памяти процесса: нормализация 437 записей на каждый запрос не нужна. */
const TTL_MS = envNum("DATA_CACHE_TTL_MS", 5 * 60 * 1000);

let charactersCache: Cached<Character[]> | null = null;
let spellsCache: Cached<Spell[]> | null = null;

/**
 * Почему очередной слой не сработал. Нужен не для красоты: на боевом стенде
 * не видно логов функции, и без этого «почему источник = snapshot, когда
 * hp-api жив» превращается в гадание. Отдаётся через /api/stats.
 */
const layerErrors: Record<string, string> = {};

export function getLayerDiagnostics(): Record<string, string> {
  return { ...layerErrors };
}

export interface SourcedResult<T> {
  data: T;
  source: DataSourceLayer;
}

function fresh<T>(cache: Cached<T> | null): SourcedResult<T> | null {
  if (cache && cache.expiresAt > Date.now()) {
    return { data: cache.data, source: cache.source };
  }
  return null;
}

async function charactersFromSupabase(): Promise<Character[] | null> {
  if (!isSupabaseConfigured()) return null;
  const client = supabaseRead();
  if (!client) return null;

  try {
    // 437 строк — одним запросом; ограничение по умолчанию в 1000 нам не мешает.
    const { data, error } = await client.from("characters").select("raw");
    if (error || !data || data.length === 0) return null;
    return normalizeCharacters(data.map((row) => row.raw as RawCharacter));
  } catch {
    return null;
  }
}

async function spellsFromSupabase(): Promise<Spell[] | null> {
  if (!isSupabaseConfigured()) return null;
  const client = supabaseRead();
  if (!client) return null;

  try {
    const { data, error } = await client.from("spells").select("id, name, description");
    if (error || !data || data.length === 0) return null;
    return normalizeSpells(data as { id: string; name: string; description: string }[]);
  } catch {
    return null;
  }
}

export async function getCharacters(): Promise<SourcedResult<Character[]>> {
  const cached = fresh(charactersCache);
  if (cached) return cached;

  const layers: [DataSourceLayer, () => Promise<Character[] | null>][] = [
    ["supabase", charactersFromSupabase],
    ["upstream", async () => normalizeCharacters(await fetchCharactersRaw())],
    [
      "snapshot",
      async () => normalizeCharacters(charactersSnapshot.items as unknown as RawCharacter[]),
    ],
  ];

  for (const [source, load] of layers) {
    try {
      const data = await load();
      if (data && data.length > 0) {
        charactersCache = { data, source, expiresAt: Date.now() + TTL_MS };
        return { data, source };
      }
    } catch (error) {
      // Слой не смог — идём к следующему. Молча падать нельзя, но и валиться тоже.
      const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      layerErrors[`characters:${source}`] = message;
      console.warn(`[data-source] слой "${source}" недоступен:`, message);
    }
  }

  // Сюда попасть нельзя: снапшот лежит в бандле и не зависит от сети.
  return { data: [], source: "snapshot" };
}

export async function getSpells(): Promise<SourcedResult<Spell[]>> {
  const cached = fresh(spellsCache);
  if (cached) return cached;

  const layers: [DataSourceLayer, () => Promise<Spell[] | null>][] = [
    ["supabase", spellsFromSupabase],
    ["upstream", async () => normalizeSpells(await fetchSpellsRaw())],
    ["snapshot", async () => normalizeSpells(spellsSnapshot.items)],
  ];

  for (const [source, load] of layers) {
    try {
      const data = await load();
      if (data && data.length > 0) {
        spellsCache = { data, source, expiresAt: Date.now() + TTL_MS };
        return { data, source };
      }
    } catch (error) {
      const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      layerErrors[`spells:${source}`] = message;
      console.warn(`[data-source] слой "${source}" недоступен:`, message);
    }
  }

  return { data: [], source: "snapshot" };
}

export async function getCharacterById(id: string): Promise<SourcedResult<Character | null>> {
  const { data, source } = await getCharacters();
  return { data: data.find((c) => c.id === id) ?? null, source };
}

/** Для страницы факультета: состав, отсортированный по заполненности карточки. */
export async function getCharactersByHouse(house: string): Promise<SourcedResult<Character[]>> {
  const { data, source } = await getCharacters();
  return {
    data: data
      .filter((c) => c.house === house)
      .sort((a, b) => b.completeness - a.completeness || a.name.localeCompare(b.name)),
    source,
  };
}

/** Сводка для главной: сколько кого известно. Считается из уже загруженного списка. */
export async function getCatalogStats() {
  const { data, source } = await getCharacters();
  const byHouse: Record<string, number> = {};
  for (const character of data) {
    if (character.house) byHouse[character.house] = (byHouse[character.house] ?? 0) + 1;
  }
  return {
    source,
    total: data.length,
    withImage: data.filter((c) => c.hasImage).length,
    students: data.filter((c) => c.role === "student").length,
    staff: data.filter((c) => c.role === "staff").length,
    byHouse,
  };
}
