"use client";

import { useMemo, useState } from "react";

import type { Dictionary } from "@/lib/i18n/dict";
import type { Spell, SpellCategory } from "@/lib/types";

const ORDER: SpellCategory[] = [
  "unforgivable",
  "dark",
  "defense",
  "healing",
  "mind",
  "conjuring",
  "transfiguration",
  "revealing",
  "utility",
];

/** Цвет раздела: непростительные — тревожный, бытовые — спокойный. */
const TONE: Record<SpellCategory, string> = {
  unforgivable: "#c2452a",
  dark: "#8d5bb5",
  defense: "#4f8fd6",
  healing: "#4fb07a",
  mind: "#c07fc0",
  conjuring: "#d69b3f",
  transfiguration: "#4fb0a8",
  revealing: "#9aa4c8",
  utility: "#a8977a",
};

/**
 * Все 77 заклинаний приходят с сервера одним куском и фильтруются на клиенте.
 * Ходить в API на каждую букву ради списка, который целиком весит 10 КБ,
 * было бы расточительством — а так поиск отзывается мгновенно.
 */
export function SpellBook({ spells, t }: { spells: Spell[]; t: Dictionary }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SpellCategory | "">("");

  const counts = useMemo(() => {
    const map = new Map<SpellCategory, number>();
    for (const spell of spells) map.set(spell.category, (map.get(spell.category) ?? 0) + 1);
    return map;
  }, [spells]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spells.filter((spell) => {
      if (category && spell.category !== category) return false;
      if (!q) return true;
      return (
        spell.name.toLowerCase().includes(q) || spell.description.toLowerCase().includes(q)
      );
    });
  }, [spells, query, category]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs transition-colors ${
      active
        ? "border-gold/60 bg-[rgba(201,162,39,0.14)] text-gold"
        : "border-line text-muted hover:border-line-strong hover:text-ink"
    }`;

  return (
    <div>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.spells.searchPlaceholder}
          aria-label={t.common.search}
          className="w-full rounded-full border border-line bg-surface px-5 py-3 text-ink outline-none transition-colors placeholder:text-faint focus:border-gold/60"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setCategory("")} className={chip(!category)}>
          {t.common.all} ({spells.length})
        </button>
        {ORDER.filter((key) => counts.has(key)).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(category === key ? "" : key)}
            className={chip(category === key)}
            style={category === key ? { borderColor: TONE[key], color: TONE[key] } : undefined}
          >
            {t.spells.categories[key]} ({counts.get(key)})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="card mt-8 px-6 py-14 text-center text-muted">{t.spells.noResults}</p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((spell) => (
            <li key={spell.id} className="card card-hover relative overflow-hidden p-5">
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{ background: TONE[spell.category] }}
              />
              {/* h2, а не h3: сетка идёт сразу под h1 страницы. */}
              <h2 className="font-[family-name:var(--font-display)] text-lg text-ink">
                {spell.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{spell.description}</p>
              <p
                className="mt-3 text-[0.68rem] uppercase tracking-widest"
                style={{ color: TONE[spell.category] }}
              >
                {t.spells.categories[spell.category]}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
