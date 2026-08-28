import type { Character } from "@/lib/types";

/**
 * Поиск по каталогу.
 *
 * В hp-api поиска нет вообще — он отдаёт все 437 записей одним куском.
 * Поэтому ранжирование живёт здесь, на сервере, и учитывает две вещи,
 * которых не даёт наивный includes():
 *   1) совпадение по прозвищу («избранный» → Harry Potter);
 *   2) опечатку в одну букву («Гермона» → Гермиона).
 */

/** Расстояние Дамерау — Левенштейна с ранним выходом: нам нужно знать лишь «<= max». */
function editDistanceWithin(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a === b) return 0;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    // Ни одна ячейка строки не влезла в лимит — дальше будет только хуже.
    if (rowMin > max) return max + 1;
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Допуск на опечатки: для коротких слов ошибаться нельзя, для длинных — можно на одну-две буквы. */
function typoBudget(word: string): number {
  if (word.length <= 3) return 0;
  if (word.length <= 6) return 1;
  return 2;
}

/**
 * Оценка совпадения, 0 — не подходит. Чем выше, тем выше в выдаче.
 * Баллы подобраны так, чтобы точное начало имени всегда било совпадение
 * по актёру или факультету.
 */
export function scoreCharacter(character: Character, query: string): number {
  if (!query) return 0;

  const name = character.name.toLowerCase();
  const index = character.searchIndex;

  if (name === query) return 1000;
  if (name.startsWith(query)) return 800;

  // Совпадение с начала любого слова в имени: «поттер», «granger».
  const nameWords = name.split(/\s+/);
  if (nameWords.some((w) => w.startsWith(query))) return 600;

  if (name.includes(query)) return 400;

  // Прозвища, актёр, факультет, патронус, русские алиасы — всё лежит в индексе.
  if (index.includes(query)) {
    const alt = character.alternateNames.some((n) => n.toLowerCase().includes(query));
    return alt ? 300 : 200;
  }

  // Последний шанс: опечатка в одном слове запроса.
  const budget = typoBudget(query);
  if (budget > 0) {
    const indexWords = index.split(/[\s,]+/).filter((w) => w.length > 2);
    for (const word of indexWords) {
      if (editDistanceWithin(query, word, budget) <= budget) return 100;
    }
  }

  return 0;
}

export interface CharacterFilters {
  q?: string;
  house?: string;
  species?: string;
  role?: "student" | "staff";
  status?: "alive" | "dead";
  hasImage?: boolean;
  sort?: "relevance" | "name" | "completeness";
}

/**
 * Фильтрация + сортировка всего каталога.
 *
 * Сортировка по умолчанию — по заполненности карточки. Это не украшательство:
 * у 412 из 437 персонажей нет фотографии, и без такой сортировки каталог
 * открывается на безымянных статистах вместо главных героев.
 */
export function selectCharacters(all: Character[], filters: CharacterFilters): Character[] {
  const query = filters.q ? normalizeQuery(filters.q) : "";

  let result = all;

  if (filters.house) {
    const house = filters.house.toLowerCase();
    result = result.filter((c) => c.house === house);
  }
  if (filters.species) {
    const species = filters.species.toLowerCase();
    result = result.filter((c) => (c.species ?? "").toLowerCase() === species);
  }
  if (filters.role) {
    result = result.filter((c) => c.role === filters.role);
  }
  if (filters.status) {
    result = result.filter((c) => (filters.status === "alive" ? c.alive : !c.alive));
  }
  if (filters.hasImage) {
    result = result.filter((c) => c.hasImage);
  }

  if (query) {
    const scored: { character: Character; score: number }[] = [];
    for (const character of result) {
      const score = scoreCharacter(character, query);
      if (score > 0) scored.push({ character, score });
    }
    scored.sort(
      (a, b) =>
        b.score - a.score ||
        b.character.completeness - a.character.completeness ||
        a.character.name.localeCompare(b.character.name),
    );
    return scored.map((s) => s.character);
  }

  const sorted = [...result];
  if (filters.sort === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    sorted.sort((a, b) => b.completeness - a.completeness || a.name.localeCompare(b.name));
  }
  return sorted;
}
