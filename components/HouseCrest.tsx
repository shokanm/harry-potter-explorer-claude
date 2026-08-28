import type { HouseSlug } from "@/lib/content/houses";

/**
 * Гербовые знаки факультетов.
 *
 * Рисуются в SVG, а не берутся картинками: настоящая геральдика Хогвартса —
 * чужая интеллектуальная собственность, а силуэт зверя в щите передаёт
 * принадлежность и остаётся собственной графикой. Заодно ноль запросов.
 */
const PATHS: Record<HouseSlug, string> = {
  // Лев: грива и профиль
  gryffindor:
    "M32 20c-5 0-9 3-10 8-4 1-7 4-7 9 0 4 2 7 5 9v10c0 6 5 10 12 10s12-4 12-10V46c3-2 5-5 5-9 0-5-3-8-7-9-1-5-5-8-10-8Zm-6 20a2.4 2.4 0 1 1 0-5 2.4 2.4 0 0 1 0 5Zm12 0a2.4 2.4 0 1 1 0-5 2.4 2.4 0 0 1 0 5Zm-6 8c-3 0-5-1-6-3h12c-1 2-3 3-6 3Z",
  // Змея: свернувшееся тело
  slytherin:
    "M20 18c10-4 22 0 26 8 3 7-1 14-8 16-5 1-9 4-9 8 0 5 4 8 10 8 7 0 12-4 13-10h6c-1 10-9 17-19 17-10 0-17-6-17-15 0-8 5-13 13-15 5-1 8-4 7-8-2-5-9-7-16-5l-6-4Z",
  // Орёл: расправленные крылья
  ravenclaw:
    "M32 16c3 0 5 2 6 5l3 7 14-6-9 12 10 5-13 2 5 12-11-8-11 8 5-12-13-2 10-5-9-12 14 6 3-7c1-3 3-5 6-5Z",
  // Барсук: морда с полосой
  hufflepuff:
    "M32 20c-8 0-15 5-17 13-1 4-1 8 1 12 3 7 9 12 16 12s13-5 16-12c2-4 2-8 1-12-2-8-9-13-17-13Zm-8 18a2.6 2.6 0 1 1 0-5 2.6 2.6 0 0 1 0 5Zm16 0a2.6 2.6 0 1 1 0-5 2.6 2.6 0 0 1 0 5Zm-8 12c-4 0-7-2-8-5h16c-1 3-4 5-8 5Zm0-30 3 8h-6l3-8Z",
};

export function HouseCrest({
  house,
  className = "",
  strokeOnly = false,
}: {
  house: HouseSlug;
  className?: string;
  strokeOnly?: boolean;
}) {
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden focusable="false">
      {/* Щит */}
      <path
        d="M32 3 60 11v26c0 16-11 27-28 32C15 64 4 53 4 37V11L32 3Z"
        fill={strokeOnly ? "none" : "currentColor"}
        fillOpacity={strokeOnly ? 0 : 0.1}
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d={PATHS[house]} fill="currentColor" fillOpacity="0.85" transform="translate(0,2)" />
    </svg>
  );
}
