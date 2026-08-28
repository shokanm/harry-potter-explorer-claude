import Image from "next/image";

import { portraitStyle } from "@/lib/portrait";
import type { Character } from "@/lib/types";

/**
 * Портрет персонажа.
 *
 * Фотография есть у 25 из 437 — остальным рисуется рама с монограммой,
 * детерминированно выведенная из id. Компонент один: вызывающий код
 * не должен помнить, кому повезло с фотографией, а кому нет.
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
        className={`h-full w-full object-cover object-top ${className}`}
      />
    );
  }

  const style = portraitStyle(character);
  const gradientId = `pg-${character.portraitSeed.toString(36)}`;

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={character.name}
      className={`h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={style.from} />
          <stop offset="100%" stopColor={style.to} />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill={`url(#${gradientId})`} />

      {/* Овальная рама портрета — то, что отличает картину от плашки. */}
      <ellipse
        cx="50"
        cy="47"
        rx="30"
        ry="36"
        fill="none"
        stroke={style.ink}
        strokeOpacity="0.28"
        strokeWidth="1.1"
      />
      <ellipse
        cx="50"
        cy="47"
        rx="26"
        ry="32"
        fill="none"
        stroke={style.ink}
        strokeOpacity="0.14"
        strokeWidth="0.6"
      />

      <text
        x="50"
        y="47"
        textAnchor="middle"
        dominantBaseline="central"
        fill={style.ink}
        fillOpacity="0.9"
        fontSize={style.isSigil ? 26 : 21}
        fontFamily={style.isSigil ? "system-ui, sans-serif" : "var(--font-display), Palatino, serif"}
        letterSpacing={style.isSigil ? 0 : 1.5}
      >
        {style.glyph}
      </text>

      {/* Подпись на раме — намёк на музейную табличку. */}
      <rect x="34" y="86" width="32" height="0.7" fill={style.ink} fillOpacity="0.3" />
    </svg>
  );
}
