import type { Character } from "@/lib/types";

/**
 * Поисковый индекс — внутреннее поле: на 437 записях это примерно четверть
 * веса ответа, а клиенту он не нужен. Отрезаем на границе API.
 */
export type PublicCharacter = Omit<Character, "searchIndex">;

export function toPublic(character: Character): PublicCharacter {
  const { searchIndex: _searchIndex, ...rest } = character;
  return rest;
}

export function toPublicList(characters: Character[]): PublicCharacter[] {
  return characters.map(toPublic);
}
