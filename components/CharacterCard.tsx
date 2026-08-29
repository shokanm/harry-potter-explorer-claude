import Link from "next/link";

import { FavoriteButton } from "@/components/FavoriteButton";
import { Portrait } from "@/components/Portrait";
import { HOUSE_BY_SLUG } from "@/lib/content/houses";
import type { Dictionary } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/types";
import type { PublicCharacter } from "@/lib/serialize";

/**
 * Заметка о персонаже.
 *
 * Свёрстана как газетная колонка: клише сверху, под ним заголовок, рубрика
 * факультета и подпись. Никаких скруглений и теней — только волосные линейки.
 */
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
      className="notice notice-hover group relative flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b border-rule bg-paper-deep">
        <Portrait character={character} size={360} priority={priority} />

        <div className="absolute right-1.5 top-1.5">
          <FavoriteButton
            id={character.id}
            addLabel={t.character.addFavorite}
            removeLabel={t.character.removeFavorite}
          />
        </div>

        {!character.hasImage && <span className="sr-only">{t.character.generatedPortrait}</span>}
      </div>

      <div className="flex flex-1 flex-col p-3">
        {house ? (
          <span
            className="tag mb-1.5 self-start"
            style={{ background: house.colors.wash, color: house.colors.onPaper }}
          >
            {house.name[lang]}
          </span>
        ) : (
          <span className="tag mb-1.5 self-start text-faint">{t.character.houseless}</span>
        )}

        <Heading className="text-[1.02rem] leading-tight text-ink group-hover:text-seal">
          {character.name}
        </Heading>

        <p className="caption mt-1.5">
          {character.patronus ? (
            <>
              {t.character.patronus}: <span className="text-soft">{character.patronus}</span>
            </>
          ) : (
            character.species ?? t.common.unknown
          )}
        </p>
      </div>
    </Link>
  );
}
