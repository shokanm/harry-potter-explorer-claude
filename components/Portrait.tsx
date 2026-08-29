import Image from "next/image";

import { portraitStyle } from "@/lib/portrait";
import type { Character } from "@/lib/types";

/**
 * Портрет персонажа.
 *
 * Фотографии печатаются как в старой газете — обесцвеченными и подкрашенными
 * в тон бумаги (класс .halftone). У кого фотографии нет, тому набирается
 * гравюра с монограммой. Компонент один: вызывающий код не должен помнить,
 * кому повезло со снимком.
 */
export function Portrait({
  character,
  size = 320,
  priority = false,
  className = "",
}: {
  character: Pick<Character, "name" | "house" | "species" | "portraitSeed" | "image" | "hasImage">;
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  if (character.hasImage && character.image) {
    return (
      <Image
        src={character.image}
        alt={character.name}
        width={size}
        height={size}
        priority={priority}
        sizes={`${size}px`}
        className={`halftone h-full w-full object-cover object-top ${className}`}
      />
    );
  }

  const style = portraitStyle(character);
  const id = character.portraitSeed.toString(36);

  return (
    <svg
      viewBox="0 0 100 120"
      role="img"
      aria-label={character.name}
      className={`h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Штриховка вместо заливки — так фон читается как печать, а не как плашка. */}
        <pattern id={`h-${id}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke={style.ink} strokeWidth="1" opacity={style.hatch} />
        </pattern>
      </defs>

      <rect width="100" height="120" fill={style.paper} />
      <rect width="100" height="120" fill={`url(#h-${id})`} />

      {/* Наборная рамка: двойная линейка по краю клише. */}
      <rect x="6" y="6" width="88" height="108" fill="none" stroke={style.ink} strokeOpacity="0.5" strokeWidth="0.9" />
      <rect x="9" y="9" width="82" height="102" fill="none" stroke={style.ink} strokeOpacity="0.25" strokeWidth="0.5" />

      <text
        x="50"
        y="56"
        textAnchor="middle"
        dominantBaseline="central"
        fill={style.ink}
        fillOpacity="0.88"
        fontSize={style.isSigil ? 30 : 26}
        fontFamily={style.isSigil ? "system-ui, sans-serif" : "var(--font-display), Times, serif"}
        fontWeight="700"
        letterSpacing={style.isSigil ? 0 : 2}
      >
        {style.glyph}
      </text>

      {/*
        Линейка и наборные звёздочки под монограммой — место, где в газете
        стояла бы подпись. Словами не подписываем намеренно: текст внутри SVG
        не переводится вместе с интерфейсом, а объяснение и без того есть
        в подписи к карточке и в скрытом тексте для скринридера.
      */}
      <line x1="34" y1="76" x2="66" y2="76" stroke={style.ink} strokeOpacity="0.45" strokeWidth="0.8" />
      <text
        x="50"
        y="88"
        textAnchor="middle"
        fill={style.ink}
        fillOpacity="0.4"
        fontSize="6"
        letterSpacing="3"
      >
        ✦ ✦ ✦
      </text>
    </svg>
  );
}
