"use client";

import { useState } from "react";

import type { Artifact, ArtifactCategory } from "@/lib/content/artifacts";
import type { Dictionary } from "@/lib/i18n/dict";
import type { Lang, Localized } from "@/lib/i18n/types";

/** Тона разделов — краской по бумаге, поэтому все тёмные. */
const CATEGORY_TONE: Record<ArtifactCategory, string> = {
  hallow: "#4a3a6b",
  horcrux: "#8f1d12",
  hogwarts: "#8a6410",
  object: "#1c5060",
};

/** Шкала опасности: пять делений, заполненные — тревожным цветом раздела. */
function DangerMeter({ level, label, tone }: { level: number; label: string; tone: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={label} aria-label={`${label}: ${level}/5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          aria-hidden
          className="h-2.5 w-2 border"
          style={{
            background: index < level ? tone : "transparent",
            borderColor: index < level ? tone : "var(--rule-strong)",
          }}
        />
      ))}
    </span>
  );
}

export function ArtifactShelf({
  artifacts,
  categories,
  lang,
  t,
}: {
  artifacts: Artifact[];
  categories: { key: ArtifactCategory; label: Localized }[];
  lang: Lang;
  t: Dictionary;
}) {
  const [active, setActive] = useState<ArtifactCategory | "">("");
  const [opened, setOpened] = useState<string | null>(null);

  const filtered = active ? artifacts.filter((item) => item.category === active) : artifacts;

  const chip = (isActive: boolean) =>
    `border px-2.5 py-1 font-[family-name:var(--font-label)] text-[0.72rem] font-bold uppercase tracking-[0.1em] transition-colors ${
      isActive
        ? "border-ink bg-ink text-paper"
        : "border-rule text-soft hover:border-rule-strong hover:text-ink"
    }`;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setActive("")} className={chip(!active)}>
          {t.common.all} ({artifacts.length})
        </button>
        {categories.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => setActive(active === category.key ? "" : category.key)}
            className={chip(active === category.key)}
            style={
              active === category.key
                ? { borderColor: CATEGORY_TONE[category.key], background: CATEGORY_TONE[category.key] }
                : undefined
            }
          >
            {category.label[lang]} ({artifacts.filter((a) => a.category === category.key).length})
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {filtered.map((artifact) => {
          const tone = CATEGORY_TONE[artifact.category];
          const isOpen = opened === artifact.slug;

          return (
            <li key={artifact.slug} className="notice">
              <div className="flex gap-4 p-5">
                <span
                  aria-hidden
                  className="grid h-12 w-12 shrink-0 place-items-center border text-xl"
                  style={{ borderColor: tone, color: tone }}
                >
                  {artifact.sigil}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="tag" style={{ color: tone }}>
                    {categories.find((c) => c.key === artifact.category)?.label[lang]}
                  </p>
                  {/* h2, а не h3: список идёт сразу под h1 страницы. */}
                  <h2 className="mt-1 text-[1.4rem] text-ink">{artifact.name[lang]}</h2>

                  <p className="mt-2.5 text-[0.95rem] leading-relaxed text-soft">
                    {artifact.description[lang]}
                  </p>

                  <dl className="mt-4 space-y-1.5 text-xs">
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 font-[family-name:var(--font-label)] uppercase tracking-[0.08em] text-faint">{t.artifacts.owner}</dt>
                      <dd className="text-soft">{artifact.owner[lang]}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 font-[family-name:var(--font-label)] uppercase tracking-[0.08em] text-faint">{t.artifacts.firstSeen}</dt>
                      <dd className="text-soft">{artifact.firstSeen[lang]}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <dt className="w-20 shrink-0 font-[family-name:var(--font-label)] uppercase tracking-[0.08em] text-faint">{t.artifacts.danger}</dt>
                      <dd className="flex items-center gap-2 text-soft">
                        <DangerMeter
                          level={artifact.danger}
                          label={t.artifacts.danger}
                          tone={tone}
                        />
                        <span>{t.artifacts.dangerLevels[artifact.danger]}</span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpened(isOpen ? null : artifact.slug)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 border-t border-rule px-5 py-3 text-left font-[family-name:var(--font-label)] text-[0.72rem] font-bold uppercase tracking-[0.12em] text-soft transition-colors hover:text-seal"
              >
                <span>{t.artifacts.lore}</span>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isOpen && (
                <p className="press-in border-t border-rule bg-paper-deep px-5 py-4 text-[0.95rem] leading-relaxed text-soft">
                  {artifact.lore[lang]}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
