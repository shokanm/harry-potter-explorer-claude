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
      className="flex items-center gap-1.5"
      role="group"
      aria-label={lang === "ru" ? "Язык интерфейса" : "Interface language"}
      data-pending={pending || undefined}
    >
      {LANGS.map((code, index) => (
        <span key={code} className="flex items-center gap-1.5">
          {index > 0 && <span aria-hidden className="h-2.5 w-px bg-[var(--rule-strong)]" />}
          <button
            type="button"
            onClick={() => choose(code)}
            aria-pressed={code === lang}
            className={`font-[family-name:var(--font-label)] text-[0.62rem] font-bold uppercase tracking-[0.18em] transition-colors ${
              code === lang ? "text-seal underline underline-offset-2" : "text-faint hover:text-ink"
            }`}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  );
}
