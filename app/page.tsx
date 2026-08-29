import Link from "next/link";

import { CharacterGrid } from "@/components/CharacterGrid";
import { HouseCrest } from "@/components/HouseCrest";
import { LiveSorting } from "@/components/LiveSorting";
import { ARTIFACTS } from "@/lib/content/artifacts";
import { HOUSES } from "@/lib/content/houses";
import { getCharacters, getSpells } from "@/lib/data-source";
import { getDict } from "@/lib/i18n/server";
import { toPublicList } from "@/lib/serialize";
import { readSortingTally } from "@/lib/sorting-tally";

export default async function HomePage() {
  const { lang, t } = await getDict();

  const [{ data: characters }, { data: spells }, tally] = await Promise.all([
    getCharacters(),
    getSpells(),
    readSortingTally(),
  ]);

  // Первые десять — самые «полные» персонажи, у них есть фотографии.
  const featured = characters.slice(0, 10);

  const stats = [
    { value: characters.length, label: t.home.statsCharacters, href: "/characters" },
    { value: spells.length, label: t.home.statsSpells, href: "/spells" },
    { value: ARTIFACTS.length, label: t.home.statsArtifacts, href: "/artifacts" },
    { value: HOUSES.length, label: t.home.statsHouses, href: "/houses" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ── Первая полоса ─────────────────────────────────── */}
      <section className="press-in border-b border-rule-strong py-10 sm:py-14">
        <p className="kicker text-center">{t.home.heroKicker}</p>

        <h1 className="mx-auto mt-4 max-w-4xl text-center text-[2.7rem] leading-[0.98] sm:text-[4.2rem]">
          {t.home.heroTitle}
        </h1>

        <div className="mx-auto mt-8 max-w-3xl">
          <p className="dropcap text-[1.12rem] leading-relaxed text-ink">{t.home.heroSubtitle}</p>
        </div>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/characters" className="stamp">
            {t.home.heroCta}
          </Link>
          <Link href="/sorting-hat" className="stamp-ghost">
            {t.home.heroSecondary}
          </Link>
        </div>

        {/* Цифры выпуска — как справка в подвале полосы. */}
        <dl className="mt-10 grid grid-cols-2 border border-rule sm:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="notice-hover border-b border-r border-rule px-5 py-4 text-center last:border-r-0 sm:border-b-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r"
            >
              <dd className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-none text-ink">
                {stat.value}
              </dd>
              <dt className="mt-1.5 font-[family-name:var(--font-label)] text-[0.68rem] uppercase tracking-[0.14em] text-faint">
                {stat.label}
              </dt>
            </Link>
          ))}
        </dl>
      </section>

      {/* ── Факультеты ────────────────────────────────────── */}
      <section className="py-12">
        <h2 className="rule-hair text-3xl sm:text-4xl">{t.home.housesTitle}</h2>
        <p className="mt-4 max-w-2xl text-soft">{t.home.housesSubtitle}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {HOUSES.map((house) => (
            <Link
              key={house.slug}
              href={`/houses/${house.slug}`}
              className="notice notice-hover p-5"
              style={{ background: house.colors.wash }}
            >
              <span style={{ color: house.colors.onPaper }}>
                <HouseCrest house={house.slug} className="h-11 w-11" />
              </span>
              <h3 className="mt-3 text-[1.3rem]" style={{ color: house.colors.onPaper }}>
                {house.name[lang]}
              </h3>
              <p className="caption mt-1">
                {house.animal[lang]} · {house.element[lang]}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Живая сводка ──────────────────────────────────── */}
      <section className="pb-12">
        <LiveSorting
          initial={{ total: tally.total, byHouse: tally.byHouse, persistent: tally.persistent }}
          lang={lang}
          t={t}
        />
      </section>

      {/* ── Знакомые лица ─────────────────────────────────── */}
      <section className="pb-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="rule-hair text-3xl sm:text-4xl">{t.home.featuredTitle}</h2>
            <p className="mt-4 max-w-xl text-soft">{t.home.featuredSubtitle}</p>
          </div>
          <Link
            href="/characters"
            className="font-[family-name:var(--font-label)] text-[0.76rem] font-bold uppercase tracking-[0.12em] text-seal underline underline-offset-4"
          >
            {t.home.heroCta} →
          </Link>
        </div>

        <div className="mt-8">
          <CharacterGrid characters={toPublicList(featured)} lang={lang} t={t} priorityCount={5} />
        </div>
      </section>
    </div>
  );
}
