import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CharacterGrid } from "@/components/CharacterGrid";
import { HouseCrest } from "@/components/HouseCrest";
import { HOUSES, houseBySlug } from "@/lib/content/houses";
import { getCharactersByHouse } from "@/lib/data-source";
import { getDict } from "@/lib/i18n/server";
import { toPublicList } from "@/lib/serialize";

export function generateStaticParams() {
  return HOUSES.map((house) => ({ slug: house.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const house = houseBySlug(slug);
  if (!house) return {};
  const { lang } = await getDict();
  return {
    title: house.name[lang],
    description: house.description[lang],
  };
}

export default async function HousePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const house = houseBySlug(slug);
  if (!house) notFound();

  const { lang, t } = await getDict();
  const { data: members } = await getCharactersByHouse(house.slug);

  const facts: { label: string; value: string }[] = [
    { label: t.houses.founder, value: house.founder[lang] },
    { label: t.houses.animal, value: house.animal[lang] },
    { label: t.houses.element, value: house.element[lang] },
    { label: t.houses.ghost, value: house.ghost[lang] },
    { label: t.houses.head, value: house.head[lang] },
    { label: t.houses.commonRoom, value: house.commonRoom[lang] },
  ];

  return (
    <div
      // Страница целиком перекрашивается в цвета факультета: дальше вложенные
      // элементы просто читают переменные и не знают, о каком факультете речь.
      style={
        {
          "--house-primary": house.colors.primary,
          "--house-secondary": house.colors.secondary,
          "--house-ink": house.colors.ink,
          "--house-tint": house.colors.tint,
        } as React.CSSProperties
      }
    >
      {/* --- Шапка --- */}
      <div className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${house.colors.primary}66, transparent 72%)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/houses"
            className="text-xs text-muted underline decoration-dotted underline-offset-4 hover:text-house-ink"
          >
            ← {t.nav.houses}
          </Link>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <span className="shrink-0 text-house-2">
              <HouseCrest house={house.slug} className="h-24 w-24 sm:h-28 sm:w-28" />
            </span>

            <div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl">
                {house.name[lang]}
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-house-ink">
                {house.colors.label[lang]}
              </p>
              <p className="mt-5 max-w-2xl text-lg italic text-muted">«{house.motto[lang]}»</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <p className="text-lg leading-relaxed">{house.description[lang]}</p>

            <div className="card mt-8 p-6">
              <h2 className="kicker">{t.houses.lore}</h2>
              <p className="mt-3 leading-relaxed text-muted">{house.lore[lang]}</p>
            </div>
          </div>

          <div className="card h-fit p-6">
            <dl className="divide-y divide-[var(--border)]">
              {facts.map((fact) => (
                <div key={fact.label} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <dt className="w-28 shrink-0 text-xs uppercase tracking-wider text-faint">
                    {fact.label}
                  </dt>
                  <dd className="text-sm text-ink">{fact.value}</dd>
                </div>
              ))}
              <div className="flex gap-4 py-3 last:pb-0">
                <dt className="w-28 shrink-0 text-xs uppercase tracking-wider text-faint">
                  {t.houses.traits}
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {house.traits[lang].map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-house-ink"
                    >
                      {trait}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* --- Состав --- */}
        <section className="mt-16">
          <h2 className="rule text-2xl">{t.houses.members}</h2>
          <p className="mt-3 text-sm text-muted">
            {members.length} {t.houses.membersCount}
          </p>

          <div className="mt-8">
            {members.length === 0 ? (
              <p className="card px-6 py-12 text-center text-muted">{t.houses.membersEmpty}</p>
            ) : (
              <CharacterGrid
                characters={toPublicList(members)}
                lang={lang}
                t={t}
                priorityCount={5}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
