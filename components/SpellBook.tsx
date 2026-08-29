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

/**
 * Цвет раздела. Тона подобраны под печать по бумаге: все достаточно тёмные,
 * чтобы читаться как краска, а не как подсветка на экране.
 */
const TONE: Record<SpellCategory, string> = {
  unforgivable: "#8f1d12",
  dark: "#5b3a7a",
  defense: "#1c4f80",
  healing: "#1f6b45",
  mind: "#7a3a6a",
  conjuring: "#8a5a12",
  transfiguration: "#1a6560",
  revealing: "#3d4a6b",
  utility: "#5a5241",
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
    `border px-2.5 py-1 font-[family-name:var(--font-label)] text-[0.72rem] font-bold uppercase tracking-[0.1em] transition-colors ${
      active
        ? "border-ink bg-ink text-paper"
        : "border-rule text-soft hover:border-rule-strong hover:text-ink"
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
          className="w-full border border-rule-strong bg-paper-white px-4 py-2.5 text-ink outline-none transition-colors placeholder:text-faint focus:border-seal"
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
            style={category === key ? { borderColor: TONE[key], background: TONE[key] } : undefined}
          >
            {t.spells.categories[key]} ({counts.get(key)})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="notice mt-8 px-6 py-14 text-center text-soft">{t.spells.noResults}</p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((spell) => (
            <li className="notice notice-hover relative p-5" key={spell.id}>
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{ background: TONE[spell.category] }}
              />
              <p className="tag" style={{ color: TONE[spell.category] }}>
                {t.spells.categories[spell.category]}
              </p>
              {/* h2, а не h3: сетка идёт сразу под h1 страницы. */}
              <h2 className="mt-1.5 text-[1.35rem] text-ink">{spell.name}</h2>
              <p className="mt-2 text-[0.94rem] leading-relaxed text-soft">{spell.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
