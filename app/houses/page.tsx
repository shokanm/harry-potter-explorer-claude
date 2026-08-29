import type { Metadata } from "next";
import Link from "next/link";

import { HouseCrest } from "@/components/HouseCrest";
import { PageHeader } from "@/components/PageHeader";
import { HOUSES } from "@/lib/content/houses";
import { getCharacters } from "@/lib/data-source";
import { getDict } from "@/lib/i18n/server";

/** Заголовок вкладки тоже переводится — язык берётся из той же cookie. */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.houses.title, description: t.meta.houses };
}

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
              className="notice notice-hover press-in p-6"
              style={{ animationDelay: `${index * 70}ms`, background: house.colors.wash }}
            >
              <div className="flex items-start gap-5">
                <span className="shrink-0" style={{ color: house.colors.onPaper }}>
                  <HouseCrest house={house.slug} className="h-16 w-16" />
                </span>

                <div className="min-w-0">
                  <h2 className="text-[1.7rem]" style={{ color: house.colors.onPaper }}>
                    {house.name[lang]}
                  </h2>
                  <p className="tag mt-0.5 !px-0" style={{ color: house.colors.onPaper }}>
                    {house.colors.label[lang]}
                  </p>

                  <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-soft">
                    {house.description[lang]}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                    {house.traits[lang].map((trait) => (
                      <span
                        key={trait}
                        className="font-[family-name:var(--font-label)] text-[0.72rem] uppercase tracking-[0.08em] text-soft"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>

                  <p className="caption mt-4">
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
