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
      className="h-[1.05em] w-[1.05em]"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
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
        className={`stamp-ghost w-full justify-center ${active ? "text-seal" : ""}`}
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
      className={`grid h-7 w-7 place-items-center border transition-colors ${
        active
          ? "border-seal bg-paper-white text-seal"
          : "border-rule bg-paper-white/85 text-faint hover:border-rule-strong hover:text-ink"
      }`}
    >
      {star}
    </button>
  );
}
