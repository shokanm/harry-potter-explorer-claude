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
    <div>
      {/* --- Герой --- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(201,162,39,0.20), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
          <div className="max-w-2xl">
            <p className="kicker ink-in">{t.home.heroKicker}</p>
            <h1
              className="ink-in mt-4 text-5xl leading-[1.05] sm:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              <span className="gilded">{t.home.heroTitle}</span>
            </h1>
            <p
              className="ink-in mt-6 text-lg leading-relaxed text-muted"
              style={{ animationDelay: "160ms" }}
            >
              {t.home.heroSubtitle}
            </p>

            <div className="ink-in mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <Link href="/characters" className="seal">
                {t.home.heroCta}
              </Link>
              <Link href="/sorting-hat" className="seal-ghost">
                {t.home.heroSecondary}
              </Link>
            </div>
          </div>

          {/* --- Цифры --- */}
          <dl className="ink-in mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ animationDelay: "320ms" }}>
            {stats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="card card-hover px-5 py-4">
                <dt className="text-xs uppercase tracking-wider text-faint">{stat.label}</dt>
                <dd className="mt-1 font-[family-name:var(--font-display)] text-3xl text-gold">
                  {stat.value}
                </dd>
              </Link>
            ))}
          </dl>
        </div>
      </section>

      {/* --- Факультеты --- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="rule text-3xl">{t.home.housesTitle}</h2>
        <p className="mt-4 max-w-2xl text-muted">{t.home.housesSubtitle}</p>

        <div className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {HOUSES.map((house) => (
            <Link
              key={house.slug}
              href={`/houses/${house.slug}`}
              className="card card-hover group relative overflow-hidden p-5"
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-50 transition-opacity group-hover:opacity-80"
                style={{
                  background: `radial-gradient(ellipse 90% 80% at 50% 120%, ${house.colors.primary}44, transparent 70%)`,
                }}
              />
              <div className="relative">
                <span style={{ color: house.colors.secondary }}>
                  <HouseCrest house={house.slug} className="h-12 w-12" />
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg text-ink">
                  {house.name[lang]}
                </h3>
                <p className="mt-1 text-xs" style={{ color: house.colors.ink }}>
                  {house.animal[lang]} · {house.element[lang]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- Живой счётчик --- */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <LiveSorting
          initial={{ total: tally.total, byHouse: tally.byHouse, persistent: tally.persistent }}
          lang={lang}
          t={t}
        />
      </section>

      {/* --- Знакомые лица --- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="rule text-3xl">{t.home.featuredTitle}</h2>
            <p className="mt-4 max-w-xl text-muted">{t.home.featuredSubtitle}</p>
          </div>
          <Link
            href="/characters"
            className="text-sm text-muted underline decoration-dotted underline-offset-4 hover:text-gold"
          >
            {t.home.heroCta} →
          </Link>
        </div>

        <div className="mt-9">
          <CharacterGrid characters={toPublicList(featured)} lang={lang} t={t} priorityCount={5} />
        </div>
      </section>
    </div>
  );
}
