"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLanguage } from "@/app/actions";
import { LANGS, type Lang } from "@/lib/i18n/types";

export function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Lang) {
    if (next === lang) return;
    startTransition(async () => {
      await setLanguage(next);
      // Серверные компоненты перерисуются уже с новым языком.
      router.refresh();
    });
  }

  return (
    <div
      className="flex items-center rounded-full border border-line p-0.5"
      role="group"
      aria-label={lang === "ru" ? "Язык интерфейса" : "Interface language"}
      data-pending={pending || undefined}
    >
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => choose(code)}
          aria-pressed={code === lang}
          className={`rounded-full px-2.5 py-1 text-xs uppercase tracking-widest transition-colors ${
            code === lang ? "bg-gold text-[#1a1206]" : "text-muted hover:text-ink"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
