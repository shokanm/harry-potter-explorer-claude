import type {
  Character,
  CharacterRole,
  RawCharacter,
  Spell,
  SpellCategory,
  Wand,
} from "@/lib/types";
import { houseSlugFromApi } from "@/lib/content/houses";
import { RU_HOUSE_ALIASES, RU_NAME_ALIASES } from "@/lib/content/ru-aliases";

/** hp-api отдаёт пустые строки вместо null. Приводим к одному виду. */
function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function strArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => str(v)).filter((v): v is string => v !== null);
}

/**
 * FNV-1a: устойчивый числовой seed из id.
 * Нужен генератору портретов — один и тот же персонаж всегда должен
 * выглядеть одинаково, и на сервере, и на клиенте.
 */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function normalizeWand(raw: RawCharacter["wand"]): Wand | null {
  if (!raw) return null;
  const wood = str(raw.wood);
  const core = str(raw.core);
  const length = typeof raw.length === "number" && raw.length > 0 ? raw.length : null;
  if (!wood && !core && !length) return null;
  return { wood, core, length };
}

/**
 * Вес каждого поля в оценке заполненности карточки.
 * Картинка весит больше всего: именно она решает, как персонаж смотрится в каталоге.
 */
const COMPLETENESS_WEIGHTS: Record<string, number> = {
  image: 3,
  house: 2,
  patronus: 2,
  wand: 2,
  ancestry: 1,
  dateOfBirth: 1,
  actor: 1,
  species: 1,
  alternateNames: 1,
  gender: 0.5,
  eyeColour: 0.5,
  hairColour: 0.5,
};

const COMPLETENESS_TOTAL = Object.values(COMPLETENESS_WEIGHTS).reduce((a, b) => a + b, 0);

function role(raw: RawCharacter): CharacterRole {
  if (raw.hogwartsStaff) return "staff";
  if (raw.hogwartsStudent) return "student";
  return "other";
}

export function normalizeCharacter(raw: RawCharacter): Character {
  const image = str(raw.image);
  const house = houseSlugFromApi(raw.house);
  const wand = normalizeWand(raw.wand);
  const alternateNames = strArray(raw.alternate_names);
  const patronus = str(raw.patronus);
  const actor = str(raw.actor);
  const ancestry = str(raw.ancestry);
  const species = str(raw.species);
  const gender = str(raw.gender);
  const eyeColour = str(raw.eyeColour);
  const hairColour = str(raw.hairColour);
  const dateOfBirth = str(raw.dateOfBirth);

  const filled: Record<string, boolean> = {
    image: image !== null,
    house: house !== null,
    patronus: patronus !== null,
    wand: wand !== null,
    ancestry: ancestry !== null,
    dateOfBirth: dateOfBirth !== null,
    actor: actor !== null,
    species: species !== null,
    alternateNames: alternateNames.length > 0,
    gender: gender !== null,
    eyeColour: eyeColour !== null,
    hairColour: hairColour !== null,
  };

  const completeness =
    Object.entries(COMPLETENESS_WEIGHTS).reduce(
      (sum, [key, weight]) => sum + (filled[key] ? weight : 0),
      0,
    ) / COMPLETENESS_TOTAL;

  // Индекс собираем один раз здесь, а не на каждый запрос поиска.
  const searchParts = [
    raw.name,
    ...alternateNames,
    actor ?? "",
    raw.house ?? "",
    patronus ?? "",
    species ?? "",
    ancestry ?? "",
    ...(RU_NAME_ALIASES[raw.name] ?? []),
    ...(RU_HOUSE_ALIASES[raw.house] ?? []),
  ];

  return {
    id: raw.id,
    name: raw.name,
    alternateNames,
    species,
    gender,
    house,
    dateOfBirth,
    yearOfBirth: typeof raw.yearOfBirth === "number" ? raw.yearOfBirth : null,
    wizard: Boolean(raw.wizard),
    ancestry,
    eyeColour,
    hairColour,
    wand,
    patronus,
    hogwartsStudent: Boolean(raw.hogwartsStudent),
    hogwartsStaff: Boolean(raw.hogwartsStaff),
    actor,
    alternateActors: strArray(raw.alternate_actors),
    alive: Boolean(raw.alive),
    image,
    hasImage: image !== null,
    role: role(raw),
    searchIndex: searchParts.join(" ").toLowerCase(),
    portraitSeed: hashSeed(raw.id || raw.name),
    completeness: Math.round(completeness * 100) / 100,
  };
}

export function normalizeCharacters(raw: RawCharacter[]): Character[] {
  return raw.filter((r) => r && typeof r.name === "string" && r.name.trim()).map(normalizeCharacter);
}

/**
 * Правила категоризации заклинаний.
 *
 * В hp-api у заклинания есть только имя и описание — категорий нет. Правила
 * выведены из реальных 77 описаний и применяются по порядку: первое совпадение
 * побеждает, поэтому «Непростительные» проверяются раньше общей «тёмной магии».
 */
const SPELL_RULES: { category: SpellCategory; test: RegExp; field?: "name" | "both" }[] = [
  { category: "unforgivable", test: /unforgivable/i, field: "both" },
  { category: "dark", test: /\bcurse\b|dark mark|most evil|lacerations|haemorrhaging|destructive/i, field: "both" },
  { category: "healing", test: /\bheals?\b|healing|wound|bandage|airway|revives|awakens|poisoning/i },
  {
    category: "defense",
    test: /shield|protect|counter-?spell|counter already|boggart|dementor|disarm|stun|unconscious|immobilis|petrif|freezes|slows the movement/i,
  },
  { category: "mind", test: /memory|\bmind\b|confusion|eavesdrop|silenc|tongue|complete control|true identity/i },
  { category: "conjuring", test: /conjure|conjures|summons/i },
  {
    category: "transfiguration",
    test: /transform|duplicat|rapid growth|shrinks|expand|extend the capacity|softens|changes hair|into a slide|vanishes/i,
  },
  { category: "revealing", test: /reveal|detects|conceal|undetectable|appearance of its surroundings|secret/i },
];

export function categorizeSpell(name: string, description: string): SpellCategory {
  const haystack = `${name} ${description}`;
  for (const rule of SPELL_RULES) {
    const target = rule.field === "name" ? name : haystack;
    if (rule.test.test(target)) return rule.category;
  }
  return "utility";
}

export function normalizeSpell(raw: { id: string; name: string; description: string }): Spell {
  const name = raw.name.trim();
  const description = (raw.description ?? "").trim();
  return { id: raw.id, name, description, category: categorizeSpell(name, description) };
}

export function normalizeSpells(raw: { id: string; name: string; description: string }[]): Spell[] {
  return raw.filter((r) => r && r.name).map(normalizeSpell);
}
