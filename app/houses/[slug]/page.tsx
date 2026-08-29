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
          "--house-ink": house.colors.onPaper,
          "--house-tint": house.colors.wash,
        } as React.CSSProperties
      }
    >
      {/* --- Шапка --- */}
      <div className="border-b-[3px] border-double border-rule-strong" style={{ background: house.colors.wash }}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href="/houses"
            className="font-[family-name:var(--font-label)] text-[0.72rem] uppercase tracking-[0.12em] text-soft underline decoration-dotted underline-offset-4 hover:text-house"
          >
            ← {t.nav.houses}
          </Link>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <span className="shrink-0 text-house">
              <HouseCrest house={house.slug} className="h-24 w-24 sm:h-28 sm:w-28" />
            </span>

            <div>
              <h1 className="text-5xl text-house sm:text-6xl">{house.name[lang]}</h1>
              <p className="tag mt-1 !px-0 text-house">{house.colors.label[lang]}</p>
              <p className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-[1.3rem] italic leading-snug text-ink">
                «{house.motto[lang]}»
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <p className="dropcap text-[1.08rem] leading-relaxed">{house.description[lang]}</p>

            <div className="notice mt-8 p-6" style={{ background: house.colors.wash }}>
              <h2 className="kicker">{t.houses.lore}</h2>
              <p className="mt-3 leading-relaxed text-ink">{house.lore[lang]}</p>
            </div>
          </div>

          <div className="notice h-fit p-6">
            <dl className="divide-y divide-[var(--rule)]">
              {facts.map((fact) => (
                <div key={fact.label} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <dt className="w-28 shrink-0 font-[family-name:var(--font-label)] text-[0.7rem] uppercase tracking-[0.1em] text-faint">
                    {fact.label}
                  </dt>
                  <dd className="text-[0.95rem] text-ink">{fact.value}</dd>
                </div>
              ))}
              <div className="flex gap-4 py-3 last:pb-0">
                <dt className="w-28 shrink-0 font-[family-name:var(--font-label)] text-[0.7rem] uppercase tracking-[0.1em] text-faint">
                  {t.houses.traits}
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {house.traits[lang].map((trait) => (
                    <span key={trait} className="border border-rule-strong px-2 py-0.5 text-[0.8rem] text-house">
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
          <h2 className="rule-hair text-3xl">{t.houses.members}</h2>
          <p className="caption mt-3">
            {members.length} {t.houses.membersCount}
          </p>

          <div className="mt-8">
            {members.length === 0 ? (
              <p className="notice px-6 py-12 text-center text-soft">{t.houses.membersEmpty}</p>
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
