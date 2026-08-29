import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FavoriteButton } from "@/components/FavoriteButton";
import { Portrait } from "@/components/Portrait";
import { PortraitChat } from "@/components/PortraitChat";
import { HOUSE_BY_SLUG } from "@/lib/content/houses";
import { getCharacterById } from "@/lib/data-source";
import { isLlmConfigured } from "@/lib/gemini";
import { getDict } from "@/lib/i18n/server";
import type { Lang } from "@/lib/i18n/types";
import type { Character } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getCharacterById(id);
  if (!data) return { title: "404" };
  return {
    title: data.name,
    description: [data.species, data.house, data.actor].filter(Boolean).join(" · "),
  };
}

/** Три вопроса, с которых удобно начать разговор. Собираются из данных персонажа. */
function suggestionsFor(character: Character, lang: Lang): string[] {
  if (lang === "ru") {
    return [
      "Как прошёл ваш первый день в Хогвартсе?",
      character.patronus ? "Почему ваш патронус именно такой?" : "Чего вы боитесь больше всего?",
      "О чём вы жалеете?",
    ];
  }
  return [
    "How was your first day at Hogwarts?",
    character.patronus ? "Why does your Patronus take that form?" : "What frightens you most?",
    "What do you regret?",
  ];
}

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: character } = await getCharacterById(id);
  if (!character) notFound();

  const { lang, t } = await getDict();
  const house = character.house ? HOUSE_BY_SLUG[character.house] : null;

  const facts: { label: string; value: string | null }[] = [
    { label: t.character.species, value: character.species },
    { label: t.character.gender, value: character.gender },
    { label: t.character.ancestry, value: character.ancestry },
    { label: t.character.birth, value: character.dateOfBirth },
    { label: t.character.patronus, value: character.patronus },
    {
      label: t.character.wand,
      value: character.wand
        ? [
            character.wand.wood && `${t.character.wandWood}: ${character.wand.wood}`,
            character.wand.core && `${t.character.wandCore}: ${character.wand.core}`,
            character.wand.length && `${character.wand.length}″`,
          ]
            .filter(Boolean)
            .join(" · ")
        : null,
    },
    { label: t.character.eyes, value: character.eyeColour },
    { label: t.character.hair, value: character.hairColour },
    { label: t.character.actor, value: character.actor },
  ];

  const known = facts.filter((fact) => fact.value);
  const missing = facts.filter((fact) => !fact.value);
  const percent = Math.round(character.completeness * 100);

  return (
    <div
      style={
        house
          ? ({ "--house-ink": house.colors.onPaper } as React.CSSProperties)
          : undefined
      }
    >
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/characters"
          className="font-[family-name:var(--font-label)] text-[0.72rem] uppercase tracking-[0.12em] text-soft underline decoration-dotted underline-offset-4 hover:text-seal"
        >
          ← {t.character.backToCatalog}
        </Link>

        <div className="mt-6 grid gap-8 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-10">
          {/* --- Портрет --- */}
          <div className="press-in">
            <div className="notice relative aspect-[4/5] overflow-hidden">
              <Portrait character={character} size={480} priority />
              {house && (
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1"
                  style={{ background: house.colors.onPaper }}
                />
              )}
            </div>

            {!character.hasImage && <p className="caption mt-2">{t.character.generatedPortrait}</p>}

            <div className="mt-4">
              <FavoriteButton
                id={character.id}
                addLabel={t.character.addFavorite}
                removeLabel={t.character.removeFavorite}
                variant="full"
              />
            </div>
          </div>

          {/* --- Досье --- */}
          <div className="press-in" style={{ animationDelay: "90ms" }}>
            <h1 className="text-4xl sm:text-5xl">{character.name}</h1>

            {character.alternateNames.length > 0 && (
              <p className="mt-2 text-[0.95rem] italic text-soft">
                <span className="not-italic text-faint">{t.character.alternateNames}:</span>{" "}
                {character.alternateNames.join(", ")}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {house ? (
                <Link
                  href={`/houses/${house.slug}`}
                  className="tag transition-opacity hover:opacity-75"
                  style={{ background: house.colors.wash, color: house.colors.onPaper }}
                >
                  {house.name[lang]}
                </Link>
              ) : (
                <span className="tag border border-rule text-faint">{t.character.houseless}</span>
              )}

              <span className="tag border border-rule text-soft">
                {character.alive ? t.character.alive : t.character.dead}
              </span>

              {character.role !== "other" && (
                <span className="tag border border-rule text-soft">
                  {character.role === "staff" ? t.character.staff : t.character.student}
                </span>
              )}

              <span className="tag border border-rule text-soft">
                {character.wizard ? t.character.wizard : t.character.muggle}
              </span>
            </div>

            {/* Известные поля */}
            <dl className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {known.map((fact) => (
                <div key={fact.label} className="border-b border-rule pb-3">
                  <dt className="font-[family-name:var(--font-label)] text-[0.68rem] uppercase tracking-[0.12em] text-faint">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-[0.98rem] text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>

            {/*
              Полнота досье показывается честно, вместе со списком того, чего
              в источнике нет. Пустая карточка перестаёт выглядеть как ошибка
              приложения и становится фактом о самих данных.
            */}
            <div className="notice mt-7 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-[family-name:var(--font-label)] text-[0.68rem] uppercase tracking-[0.12em] text-faint">
                  {t.character.completeness}
                </span>
                <span className="font-[family-name:var(--font-display)] text-lg font-bold text-seal">
                  {percent}%
                </span>
              </div>
              <div
                className="mt-2 h-2 border border-rule bg-paper"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t.character.completeness}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${percent}%`,
                    background: house ? house.colors.onPaper : "var(--seal)",
                  }}
                />
              </div>
              <p className="caption mt-2.5">
                {t.character.completenessHint}
              </p>
              {missing.length > 0 && (
                <p className="caption mt-2">
                  {t.common.notFound}: {missing.map((fact) => fact.label.toLowerCase()).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- Разговор --- */}
        <section className="mt-14">
          <h2 className="rule-hair text-3xl">{t.character.chatTitle}</h2>
          <div className="mt-6">
            <PortraitChat
              characterId={character.id}
              characterName={character.name}
              lang={lang}
              t={t}
              available={isLlmConfigured()}
              suggestions={suggestionsFor(character, lang)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
