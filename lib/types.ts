import type { HouseSlug } from "@/lib/content/houses";

/** Палочка. В hp-api поля могут быть пустыми строками — нормализуем в null. */
export interface Wand {
  wood: string | null;
  core: string | null;
  length: number | null;
}

/** Сырой объект ровно в том виде, в каком его отдаёт hp-api. */
export interface RawCharacter {
  id: string;
  name: string;
  alternate_names: string[];
  species: string;
  gender: string;
  house: string;
  dateOfBirth: string;
  yearOfBirth: number | null;
  wizard: boolean;
  ancestry: string;
  eyeColour: string;
  hairColour: string;
  wand: { wood: string; core: string; length: number | null };
  patronus: string;
  hogwartsStudent: boolean;
  hogwartsStaff: boolean;
  actor: string;
  alternate_actors: string[];
  alive: boolean;
  image: string;
}

export type CharacterRole = "student" | "staff" | "other";

/**
 * Нормализованный персонаж — то, чем оперирует всё приложение.
 * Пустые строки из upstream заменены на null, добавлены производные поля.
 */
export interface Character {
  id: string;
  name: string;
  alternateNames: string[];
  species: string | null;
  gender: string | null;
  /** Наш slug факультета, если персонаж к нему приписан. */
  house: HouseSlug | null;
  dateOfBirth: string | null;
  yearOfBirth: number | null;
  wizard: boolean;
  ancestry: string | null;
  eyeColour: string | null;
  hairColour: string | null;
  wand: Wand | null;
  patronus: string | null;
  hogwartsStudent: boolean;
  hogwartsStaff: boolean;
  actor: string | null;
  alternateActors: string[];
  alive: boolean;
  image: string | null;

  // --- производные поля, считаются один раз при нормализации ---
  /** У 25 из 437 персонажей есть фото. Остальным рисуем портрет сами. */
  hasImage: boolean;
  role: CharacterRole;
  /** Всё, по чему ищем: имя, прозвища, актёр, факультет, патронус. Уже в нижнем регистре. */
  searchIndex: string;
  /** Устойчивый seed из id — чтобы сгенерированный портрет не менялся между рендерами. */
  portraitSeed: number;
  /**
   * Доля заполненных полей, 0..1. Используется как сортировка по умолчанию:
   * без неё каталог открывается на безымянных статистах, а не на главных героях.
   */
  completeness: number;
}

export type SpellCategory =
  | "unforgivable"
  | "dark"
  | "defense"
  | "healing"
  | "mind"
  | "conjuring"
  | "transfiguration"
  | "revealing"
  | "utility";

export interface Spell {
  id: string;
  name: string;
  description: string;
  /** Выведена из описания на сервере — в upstream категорий нет. */
  category: SpellCategory;
}

export interface Paged<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  /** Какой слой источника данных ответил: supabase | upstream | snapshot. */
  source: DataSourceLayer;
}

export type DataSourceLayer = "supabase" | "upstream" | "snapshot";
