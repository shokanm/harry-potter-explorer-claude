import Link from "next/link";

import { FavoriteButton } from "@/components/FavoriteButton";
import { Portrait } from "@/components/Portrait";
import { HOUSE_BY_SLUG } from "@/lib/content/houses";
import type { Dictionary } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/types";
import type { PublicCharacter } from "@/lib/serialize";

export function CharacterCard({
  character,
  lang,
  t,
  priority = false,
  headingLevel = 3,
}: {
  character: PublicCharacter;
  lang: Lang;
  t: Dictionary;
  priority?: boolean;
  /**
   * Уровень заголовка карточки. На страницах с промежуточным разделом
   * (главная, факультет) это h3, а там, где сетка идёт сразу под h1
   * (каталог, избранное) — h2: пропуск уровня ломает навигацию
   * по заголовкам в скринридере.
   */
  headingLevel?: 2 | 3;
}) {
  const house = character.house ? HOUSE_BY_SLUG[character.house] : null;
  const Heading = (headingLevel === 2 ? "h2" : "h3") as "h2" | "h3";

  return (
    <Link
      href={`/characters/${character.id}`}
      className="card card-hover group relative flex flex-col overflow-hidden"
      style={
        house
          ? ({ "--house-primary": house.colors.primary } as React.CSSProperties)
          : undefined
      }
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-bg-deep">
        <Portrait character={character} size={360} priority={priority} />

        {/* Затемнение снизу, чтобы имя читалось поверх любой фотографии. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[rgba(8,6,4,0.96)] via-[rgba(8,6,4,0.55)] to-transparent"
        />

        <div className="absolute right-2 top-2">
          <FavoriteButton
            id={character.id}
            addLabel={t.character.addFavorite}
            removeLabel={t.character.removeFavorite}
          />
        </div>

        {!character.hasImage && (
          <span className="sr-only">{t.character.generatedPortrait}</span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <Heading className="font-[family-name:var(--font-display)] text-[0.98rem] leading-tight text-ink">
            {character.name}
          </Heading>
          <p className="mt-1 text-xs text-muted">
            {house ? house.name[lang] : t.character.houseless}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2 text-xs">
        <span className="truncate text-faint">
          {character.patronus ? (
            <>
              <span className="text-muted">{t.character.patronus}:</span> {character.patronus}
            </>
          ) : (
            <span className="text-faint">
              {character.species ?? t.common.unknown}
            </span>
          )}
        </span>
        {house && (
          <span
            aria-hidden
            className="h-1.5 w-6 shrink-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${house.colors.primary}, ${house.colors.secondary})`,
            }}
          />
        )}
      </div>
    </Link>
  );
}
