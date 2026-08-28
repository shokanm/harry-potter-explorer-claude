import type { Character } from "@/lib/types";

export interface Facets {
  species: { value: string; count: number }[];
  houses: { value: string; count: number }[];
}

/** Варианты для фильтров каталога — считаются из самих данных, а не зашиты. */
export function buildFacets(characters: Character[]): Facets {
  const species = new Map<string, number>();
  const houses = new Map<string, number>();

  for (const character of characters) {
    if (character.species) {
      const key = character.species.toLowerCase();
      species.set(key, (species.get(key) ?? 0) + 1);
    }
    if (character.house) {
      houses.set(character.house, (houses.get(character.house) ?? 0) + 1);
    }
  }

  const sort = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

  return { species: sort(species), houses: sort(houses) };
}
