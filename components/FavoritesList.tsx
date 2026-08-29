"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CharacterGrid } from "@/components/CharacterGrid";
import { useFavorites } from "@/lib/favorites";
import type { Dictionary } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/types";
import type { PublicCharacter } from "@/lib/serialize";

/**
 * «Омут памяти».
 *
 * Список id живёт в localStorage и на сервер не уходит — поэтому страница
 * обязательно клиентская. Сами карточки подтягиваются одним запросом
 * к /api/characters?ids=…: у сервера уже есть весь каталог в памяти,
 * и выборка по списку ему бесплатна.
 */
export function FavoritesList({ lang, t }: { lang: Lang; t: Dictionary }) {
  const { ids, clear } = useFavorites();
  const [items, setItems] = useState<PublicCharacter[] | null>(null);

  useEffect(() => {
    // Пустой список обрабатывается в разметке ниже: вызывать здесь setState
    // значило бы запустить лишний каскад перерисовок ради известного заранее
    // результата.
    if (ids.length === 0) return;

    const controller = new AbortController();
    fetch(`/api/characters?ids=${ids.join(",")}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<{ items: PublicCharacter[] }>)
      .then((data) => setItems(data.items))
      .catch(() => {
        if (!controller.signal.aborted) setItems([]);
      });

    return () => controller.abort();
  }, [ids]);

  if (ids.length === 0) {
    return (
      <div className="card px-6 py-20 text-center">
        <p className="font-[family-name:var(--font-display)] text-xl text-ink">
          {t.favorites.empty}
        </p>
        <p className="mt-3 text-sm text-muted">{t.favorites.emptyHint}</p>
        <Link href="/characters" className="seal mt-7">
          {t.home.heroCta}
        </Link>
      </div>
    );
  }

  if (items === null) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton aspect-[3/4] rounded-[var(--radius)]" />
        ))}
      </div>
    );
  }

  const visible = items.filter((character) => ids.includes(character.id));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-3">
        <p className="text-sm text-muted">
          <span className="text-ink">{visible.length}</span> {t.favorites.count}
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-faint underline decoration-dotted underline-offset-4 hover:text-[#d98a6a]"
        >
          {t.favorites.clear}
        </button>
      </div>

      <CharacterGrid characters={visible} lang={lang} t={t} priorityCount={5} headingLevel={2} />
    </div>
  );
}
