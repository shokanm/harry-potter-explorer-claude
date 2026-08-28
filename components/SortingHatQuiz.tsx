"use client";

import Link from "next/link";
import { useState } from "react";

import { HouseCrest } from "@/components/HouseCrest";
import { HOUSE_BY_SLUG, type HouseSlug } from "@/lib/content/houses";
import type { SortingQuestion } from "@/lib/content/sorting-hat";
import type { Dictionary } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/types";

type Stage = "quiz" | "thinking" | "verdict";

export function SortingHatQuiz({
  questions,
  lang,
  t,
}: {
  questions: SortingQuestion[];
  lang: Lang;
  t: Dictionary;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<Stage>("quiz");
  const [house, setHouse] = useState<HouseSlug | null>(null);
  const [speech, setSpeech] = useState("");
  const [silent, setSilent] = useState(false);
  const [persisted, setPersisted] = useState(false);

  const question = questions[step];
  const progress = Math.round((step / questions.length) * 100);

  async function choose(optionId: string) {
    const next = { ...answers, [question.id]: optionId };
    setAnswers(next);

    if (step + 1 < questions.length) {
      setStep(step + 1);
      return;
    }

    setStage("thinking");
    await submit(next);
  }

  async function submit(finalAnswers: Record<string, string>) {
    try {
      const response = await fetch("/api/sorting-hat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, lang }),
      });

      // Факультет приходит заголовком — он посчитан сервером и не зависит
      // от того, справится ли модель с речью.
      const decided = response.headers.get("x-house") as HouseSlug | null;
      setHouse(decided);
      setPersisted(response.headers.get("x-persisted") === "1");
      setStage("verdict");

      if (response.headers.get("x-voice") === "silent" || !response.body) {
        setSilent(true);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assembled = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        assembled += decoder.decode(value, { stream: true });
        setSpeech(assembled);
      }

      if (!assembled.trim()) setSilent(true);
    } catch {
      setStage("verdict");
      setSilent(true);
    }
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setStage("quiz");
    setHouse(null);
    setSpeech("");
    setSilent(false);
  }

  // --- Вердикт ---
  if (stage === "verdict" && house) {
    const meta = HOUSE_BY_SLUG[house];

    return (
      <div
        className="card ink-in relative overflow-hidden p-8 sm:p-12"
        style={
          {
            "--house-primary": meta.colors.primary,
            "--house-ink": meta.colors.ink,
          } as React.CSSProperties
        }
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 90% at 50% 0%, ${meta.colors.primary}55, transparent 70%)`,
          }}
        />

        <div className="relative text-center">
          <p className="kicker">{t.sortingHat.share}</p>

          <span className="mt-6 inline-block" style={{ color: meta.colors.secondary }}>
            <HouseCrest house={house} className="h-28 w-28" />
          </span>

          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl">
            {meta.name[lang]}
          </h2>

          <div className="mx-auto mt-8 max-w-xl text-left">
            {silent ? (
              <p className="text-sm leading-relaxed text-faint">{t.sortingHat.offline}</p>
            ) : (
              <p className="whitespace-pre-wrap text-lg italic leading-relaxed text-muted">
                {speech}
                {!speech && (
                  <span className="inline-flex items-center gap-2 not-italic text-sm text-faint">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
                    {t.sortingHat.thinking}
                  </span>
                )}
              </p>
            )}
          </div>

          {persisted && <p className="mt-8 text-xs text-faint">{t.sortingHat.saved}</p>}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`/houses/${house}`} className="seal">
              {t.houses.open}
            </Link>
            <button type="button" onClick={restart} className="seal-ghost">
              {t.sortingHat.again}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Ожидание вердикта ---
  if (stage === "thinking") {
    return (
      <div className="card px-8 py-20 text-center">
        <span className="pulse-dot mx-auto block h-2 w-2 rounded-full bg-gold" aria-hidden />
        <p className="mt-6 font-[family-name:var(--font-display)] text-xl text-muted">
          {t.sortingHat.thinking}
        </p>
      </div>
    );
  }

  // --- Опрос ---
  return (
    <div className="card p-6 sm:p-9">
      <div className="flex items-center gap-4">
        <span className="text-xs uppercase tracking-widest text-faint">
          {t.sortingHat.question} {step + 1} {t.common.of} {questions.length}
        </span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-[var(--ember)] to-[var(--gold)] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </span>
      </div>

      <h2 className="mt-8 font-[family-name:var(--font-display)] text-2xl leading-snug sm:text-3xl">
        {question.text[lang]}
      </h2>
      <p className="mt-3 text-xs text-faint">{t.sortingHat.chooseHint}</p>

      <ul className="mt-7 space-y-2.5">
        {question.options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={() => void choose(option.id)}
              className="w-full rounded-[var(--radius-sm)] border border-line bg-surface px-5 py-4 text-left text-[0.98rem] leading-snug text-ink transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:bg-[rgba(201,162,39,0.07)]"
            >
              {option.text[lang]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
