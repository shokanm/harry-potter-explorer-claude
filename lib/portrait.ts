import { HOUSE_BY_SLUG } from "@/lib/content/houses";
import type { Character } from "@/lib/types";

/**
 * Генератор портретов.
 *
 * Фотография есть у 25 персонажей из 437. Ставить остальным одинаковый серый
 * прямоугольник — значит превратить каталог в кладбище заглушек, поэтому
 * каждому рисуется собственная гравюра: монограмма в наборной рамке,
 * краской по бумаге. Существам вместо букв достаётся свой знак.
 *
 * Всё детерминировано: один и тот же персонаж выглядит одинаково на сервере,
 * на клиенте и после перезагрузки. Никакой случайности и никаких запросов.
 */

/** Знаки для тех, кому монограмма не идёт: совы, коты, драконы и прочие. */
const SPECIES_SIGILS: Record<string, string> = {
  cat: "\u{1F408}",
  owl: "\u{1F989}",
  dog: "\u{1F415}",
  snake: "\u{1F40D}",
  phoenix: "\u{1F525}",
  dragon: "\u{1F409}",
  toad: "\u{1F438}",
  rat: "\u{1F400}",
  horse: "\u{1F40E}",
  centaur: "\u{1F3F9}",
  goblin: "⚒",
  "house-elf": "✦",
  elf: "✦",
  ghost: "☠",
  poltergeist: "☠",
  giant: "⛰",
  "half-giant": "⛰",
  werewolf: "\u{1F318}",
  hippogriff: "\u{1FAB6}",
  "three-headed dog": "\u{1F415}",
  troll: "\u{1FAA8}",
  acromantula: "\u{1F577}",
  merperson: "\u{1F30A}",
  vampire: "\u{1F987}",
  "giant spider": "\u{1F577}",
};

export interface PortraitStyle {
  /** Тон бумаги под гравюрой — слегка разный, чтобы соседние клише не сливались. */
  paper: string;
  /** Цвет краски: тон факультета либо обычная типографская. */
  ink: string;
  /** Плотность штриховки фона, 0..1. */
  hatch: number;
  /** Что печатать в центре: инициалы или знак существа. */
  glyph: string;
  /** Знак существа шире букв — набираем другим кеглем. */
  isSigil: boolean;
}

/** Псевдослучайное число 0..1 из seed и номера канала. Без состояния. */
function channel(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297) * 233280;
  return x - Math.floor(x);
}

function initials(name: string): string {
  const words = name
    .replace(/["'()]/g, " ")
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function portraitStyle(
  character: Pick<Character, "name" | "house" | "species" | "portraitSeed">,
): PortraitStyle {
  const seed = character.portraitSeed;
  const house = character.house ? HOUSE_BY_SLUG[character.house] : null;
  const species = (character.species ?? "").toLowerCase();
  const sigil = SPECIES_SIGILS[species];

  // Бумага чуть плавает по светлоте: полоса из одинаковых клише выглядит мёртвой.
  const lightness = 92 + Math.round(channel(seed, 1) * 5);
  const paper = `hsl(43 30% ${lightness}%)`;

  return {
    paper,
    ink: house ? house.colors.onPaper : "#14120e",
    hatch: 0.05 + channel(seed, 3) * 0.06,
    glyph: sigil ?? initials(character.name),
    isSigil: Boolean(sigil),
  };
}
