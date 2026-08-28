import type { Metadata } from "next";
import Link from "next/link";

import { HouseCrest } from "@/components/HouseCrest";
import { PageHeader } from "@/components/PageHeader";
import { HOUSES } from "@/lib/content/houses";
import { getCharacters } from "@/lib/data-source";
import { getDict } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Факультеты",
  description: "Гриффиндор, Слизерин, Когтевран и Пуффендуй: цвета, символика и основатели.",
};

export default async function HousesPage() {
  const { lang, t } = await getDict();
  const { data } = await getCharacters();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader kicker={t.nav.houses} title={t.houses.title} subtitle={t.houses.subtitle} />

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {HOUSES.map((house, index) => {
          const members = data.filter((character) => character.house === house.slug).length;

          return (
            <Link
              key={house.slug}
              href={`/houses/${house.slug}`}
              className="card card-hover ink-in group relative overflow-hidden p-6"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              {/* Цветная подложка факультета — мягкая, чтобы текст оставался читаемым. */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60"
                style={{
                  background: `radial-gradient(ellipse 70% 90% at 100% 0%, ${house.colors.primary}55, transparent 70%)`,
                }}
              />

              <div className="relative flex items-start gap-5">
                <span className="shrink-0" style={{ color: house.colors.secondary }}>
                  <HouseCrest house={house.slug} className="h-16 w-16" />
                </span>

                <div className="min-w-0">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink">
                    {house.name[lang]}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-widest" style={{ color: house.colors.ink }}>
                    {house.colors.label[lang]}
                  </p>

                  <p className="mt-3 line-clamp-3 text-sm text-muted">{house.description[lang]}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {house.traits[lang].map((trait) => (
                      <span
                        key={trait}
                        className="rounded-full border border-line px-2.5 py-1 text-[0.7rem] text-muted"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 text-xs text-faint">
                    {members} {t.houses.membersCount}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
