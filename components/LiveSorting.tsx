"use client";

import { useEffect, useRef, useState } from "react";

import { HOUSES } from "@/lib/content/houses";
import type { Dictionary } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/types";

interface Tally {
  total: number;
  byHouse: Record<string, number>;
  persistent: boolean;
}

/**
 * Живой счётчик распределений.
 *
 * Подписка идёт на НАШ /api/stats/stream, а не напрямую на Supabase Realtime:
 * к внешнему сервису по условию задачи ходит только сервер. Браузер получает
 * Server-Sent Events со своего же домена и не знает про Supabase вообще.
 *
 * EventSource сам переподключается после того, как серверный маршрут закроет
 * соединение по таймауту, так что разрывов пользователь не замечает.
 */
export function LiveSorting({
  initial,
  lang,
  t,
}: {
  initial: Tally;
  lang: Lang;
  t: Dictionary;
}) {
  const [tally, setTally] = useState<Tally>(initial);
  const [live, setLive] = useState(false);
  const [bumped, setBumped] = useState<string | null>(null);
  const previous = useRef(initial.total);

  useEffect(() => {
    const source = new EventSource("/api/stats/stream");

    source.addEventListener("tally", (event) => {
      try {
        const next = JSON.parse((event as MessageEvent).data) as Tally;
        // Подсвечиваем факультет, который только что прибавил, — иначе живое
        // обновление на глаз неотличимо от статичной картинки.
        if (next.total > previous.current) {
          const grown = Object.keys(next.byHouse).find(
            (house) => next.byHouse[house] > (tally.byHouse[house] ?? 0),
          );
          if (grown) {
            setBumped(grown);
            setTimeout(() => setBumped(null), 1400);
          }
        }
        previous.current = next.total;
        setTally(next);
        setLive(true);
      } catch {
        // битый кадр — ждём следующий
      }
    });

    source.onopen = () => setLive(true);
    source.onerror = () => setLive(false);

    return () => source.close();
    // Подписка создаётся один раз: tally читаем через замыкание намеренно,
    // пересоздавать EventSource на каждое обновление счётчика не нужно.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const max = Math.max(1, ...Object.values(tally.byHouse));

  return (
    <div className="notice p-6 sm:p-8">
      <div className="rule-double flex flex-wrap items-baseline justify-between gap-3 pb-3">
        <div>
          <p className="kicker">{t.home.liveTitle}</p>
          <p className="mt-2 text-sm text-soft">{t.home.liveSubtitle}</p>
        </div>
        <span className="inline-flex items-center gap-2 font-[family-name:var(--font-label)] text-[0.72rem] uppercase tracking-[0.12em] text-faint">
          <span
            className={`h-1.5 w-1.5 rounded-full ${live ? "pulse-dot bg-seal" : "bg-[var(--ink-faint)]"}`}
            aria-hidden
          />
          {tally.total} {t.home.liveTotal}
        </span>
      </div>

      {tally.total === 0 ? (
        <p className="caption mt-8">{t.home.liveEmpty}</p>
      ) : (
        <ul className="mt-7 space-y-3.5">
          {HOUSES.map((house) => {
            const count = tally.byHouse[house.slug] ?? 0;
            const share = Math.round((count / max) * 100);

            return (
              <li key={house.slug} className="flex items-center gap-4 border-b border-rule pb-3 last:border-0">
                <span
                  className="w-24 shrink-0 font-[family-name:var(--font-label)] text-[0.78rem] font-bold uppercase tracking-[0.08em] sm:w-28"
                  style={{ color: house.colors.onPaper }}
                >
                  {house.name[lang]}
                </span>
                <span className="h-2.5 flex-1 border border-rule bg-paper">
                  <span
                    className="block h-full transition-[width] duration-700 ease-out"
                    style={{ width: `${share}%`, background: house.colors.onPaper }}
                  />
                </span>
                <span
                  className={`w-8 shrink-0 text-right font-[family-name:var(--font-display)] text-lg font-bold tabular-nums transition-colors ${
                    bumped === house.slug ? "text-seal" : "text-ink"
                  }`}
                >
                  {count}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {!tally.persistent && tally.total > 0 && (
        <p className="caption mt-6">
          {lang === "ru"
            ? "Счёт временный: база не подключена, поэтому он живёт только до перезапуска сервера."
            : "Temporary tally: no database connected, so it lives only until the server restarts."}
        </p>
      )}
    </div>
  );
}
