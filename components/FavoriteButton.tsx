"use client";

import { useFavorites } from "@/lib/favorites";

export function FavoriteButton({
  id,
  addLabel,
  removeLabel,
  variant = "icon",
}: {
  id: string;
  addLabel: string;
  removeLabel: string;
  variant?: "icon" | "full";
}) {
  const { has, toggle } = useFavorites();
  const active = has(id);
  const label = active ? removeLabel : addLabel;

  const star = (
    <svg
      viewBox="0 0 24 24"
      className="h-[1.1em] w-[1.1em]"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3.5l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.9l6.1-.8L12 3.5Z" />
    </svg>
  );

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-pressed={active}
        className={`seal-ghost ${active ? "text-gold" : ""}`}
      >
        {star}
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        // Кнопка лежит внутри ссылки-карточки — гасим переход.
        event.preventDefault();
        event.stopPropagation();
        toggle(id);
      }}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-full border backdrop-blur-sm transition-colors ${
        active
          ? "border-gold/60 bg-[rgba(12,9,6,0.75)] text-gold"
          : "border-line bg-[rgba(12,9,6,0.6)] text-muted hover:border-line-strong hover:text-ink"
      }`}
    >
      {star}
    </button>
  );
}
