import artifactsData from "@/data/artifacts.json";
import type { Localized } from "@/lib/i18n/types";

export type ArtifactCategory = "hallow" | "horcrux" | "hogwarts" | "object";

export const ARTIFACT_CATEGORIES: { key: ArtifactCategory; label: Localized }[] = [
  { key: "hallow", label: { ru: "Дары Смерти", en: "Deathly Hallows" } },
  { key: "horcrux", label: { ru: "Крестражи", en: "Horcruxes" } },
  { key: "hogwarts", label: { ru: "Реликвии Хогвартса", en: "Hogwarts Relics" } },
  { key: "object", label: { ru: "Магические предметы", en: "Magical Objects" } },
];

export interface Artifact {
  slug: string;
  name: Localized;
  category: ArtifactCategory;
  owner: Localized;
  firstSeen: Localized;
  description: Localized;
  /** Деталь, которую знают не все — то, ради чего страницу читают до конца. */
  lore: Localized;
  /** 0 — безобидно, 5 — смертельно. Рисуем шкалой. */
  danger: number;
  /** Символ для карточки: своей графики у артефактов нет. */
  sigil: string;
}

/**
 * Сами данные лежат в data/artifacts.json.
 *
 * Один и тот же файл читают приложение и scripts/sync.mjs, который заливает
 * артефакты в Supabase. Держать копию списка ещё и в скрипте значило бы
 * однажды поправить одну из них и забыть про вторую.
 */
export const ARTIFACTS = artifactsData as Artifact[];

export const ARTIFACT_BY_SLUG: Record<string, Artifact> = Object.fromEntries(
  ARTIFACTS.map((a) => [a.slug, a]),
);
