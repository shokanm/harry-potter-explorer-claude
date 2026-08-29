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
        className="notice press-in relative overflow-hidden p-8 sm:p-12"
        style={{ background: meta.colors.wash }}
      >
        <div className="relative text-center">
          <p className="kicker">{t.sortingHat.share}</p>

          <span className="mt-6 inline-block" style={{ color: meta.colors.onPaper }}>
            <HouseCrest house={house} className="h-24 w-24" />
          </span>

          <h2 className="mt-3 text-5xl sm:text-6xl" style={{ color: meta.colors.onPaper }}>
            {meta.name[lang]}
          </h2>

          <div className="mx-auto mt-8 max-w-xl text-left">
            {silent ? (
              <p className="caption">{t.sortingHat.offline}</p>
            ) : (
              <p className="whitespace-pre-wrap border-t border-rule-strong pt-6 text-[1.08rem] leading-relaxed text-ink">
                {speech}
                {!speech && (
                  <span className="inline-flex items-center gap-2 text-sm text-faint">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-seal" />
                    {t.sortingHat.thinking}
                  </span>
                )}
              </p>
            )}
          </div>

          {persisted && <p className="caption mt-8">{t.sortingHat.saved}</p>}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`/houses/${house}`} className="stamp">
              {t.houses.open}
            </Link>
            <button type="button" onClick={restart} className="stamp-ghost">
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
      <div className="notice px-8 py-20 text-center">
        <span className="pulse-dot mx-auto block h-2 w-2 rounded-full bg-seal" aria-hidden />
        <p className="mt-6 font-[family-name:var(--font-display)] text-2xl text-soft">
          {t.sortingHat.thinking}
        </p>
      </div>
    );
  }

  // --- Опрос ---
  return (
    <div className="notice p-6 sm:p-9">
      <div className="flex items-center gap-4">
        <span className="kicker shrink-0">
          {t.sortingHat.question} {step + 1} {t.common.of} {questions.length}
        </span>
        <span className="h-[3px] flex-1 bg-[var(--rule)]">
          <span
            className="block h-full bg-seal transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </span>
      </div>

      <h2 className="mt-7 text-3xl leading-tight sm:text-4xl">{question.text[lang]}</h2>
      <p className="caption mt-3">{t.sortingHat.chooseHint}</p>

      <ul className="mt-7 space-y-2.5">
        {question.options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={() => void choose(option.id)}
              className="w-full border border-rule bg-paper px-5 py-4 text-left text-[1.02rem] leading-snug text-ink transition-colors hover:border-ink hover:bg-paper-deep"
            >
              {option.text[lang]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
