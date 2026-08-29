"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CharacterGrid } from "@/components/CharacterGrid";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { HOUSES } from "@/lib/content/houses";
import type { Facets } from "@/lib/facets";
import type { Dictionary } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/types";
import type { PublicCharacter } from "@/lib/serialize";
import type { DataSourceLayer } from "@/lib/types";

export interface CatalogFilters {
  q: string;
  house: string;
  species: string;
  role: string;
  status: string;
  withImage: boolean;
  sort: string;
}

export const EMPTY_FILTERS: CatalogFilters = {
  q: "",
  house: "",
  species: "",
  role: "",
  status: "",
  withImage: false,
  sort: "relevance",
};

interface Props {
  lang: Lang;
  t: Dictionary;
  initialFilters: CatalogFilters;
  initialItems: PublicCharacter[];
  initialTotal: number;
  initialHasMore: boolean;
  initialSource: DataSourceLayer;
  facets: Facets;
}

const PAGE_SIZE = 24;
const DEBOUNCE_MS = 280;

function toQuery(filters: CatalogFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.house) params.set("house", filters.house);
  if (filters.species) params.set("species", filters.species);
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  if (filters.withImage) params.set("withImage", "1");
  if (filters.sort && filters.sort !== "relevance") params.set("sort", filters.sort);
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));
  return params.toString();
}

function isDefault(filters: CatalogFilters): boolean {
  return (
    !filters.q &&
    !filters.house &&
    !filters.species &&
    !filters.role &&
    !filters.status &&
    !filters.withImage &&
    filters.sort === "relevance"
  );
}

export function CharacterCatalog({
  lang,
  t,
  initialFilters,
  initialItems,
  initialTotal,
  initialHasMore,
  initialSource,
  facets,
}: Props) {
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const [items, setItems] = useState<PublicCharacter[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [source, setSource] = useState<DataSourceLayer>(initialSource);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  /**
   * Подпись уже загруженной выборки. Стартует со значения, отрисованного
   * сервером, поэтому монтирование не вызывает повторный запрос за тем же
   * самым — в том числе при двойном вызове эффектов в StrictMode.
   */
  const loadedSignature = useRef(JSON.stringify(initialFilters));
  const requestId = useRef(0);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const load = useCallback(
    async (nextFilters: CatalogFilters, nextPage: number, append: boolean) => {
      const id = ++requestId.current;
      setLoading(true);
      setFailed(false);

      try {
        const response = await fetch(`/api/characters?${toQuery(nextFilters, nextPage)}`);
        if (!response.ok) throw new Error(`http ${response.status}`);
        const data = (await response.json()) as {
          items: PublicCharacter[];
          total: number;
          hasMore: boolean;
          source: DataSourceLayer;
        };

        // Пока ждали ответ, пользователь мог набрать что-то ещё — тот ответ уже неактуален.
        if (id !== requestId.current) return;

        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setTotal(data.total);
        setHasMore(data.hasMore);
        setSource(data.source);
        setPage(nextPage);
      } catch {
        if (id === requestId.current) setFailed(true);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [],
  );

  // Смена фильтров: сбрасываем ленту и перезапрашиваем с первой страницы.
  useEffect(() => {
    const signature = JSON.stringify(filters);
    if (signature === loadedSignature.current) return;

    const timer = setTimeout(() => {
      loadedSignature.current = signature;
      void load(filters, 1, false);

      // Держим адресную строку в согласии с фильтрами, чтобы выдачей
      // можно было поделиться ссылкой. History не засоряем — replace.
      const params = new URLSearchParams(toQuery(filters, 1));
      params.delete("page");
      params.delete("limit");
      const query = params.toString();
      window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filters, load]);

  // Бесконечная лента: догружаем, когда маркер подходит к нижнему краю.
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          void load(filters, page + 1, true);
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [filters, hasMore, loading, page, load]);

  const update = (patch: Partial<CatalogFilters>) => setFilters((prev) => ({ ...prev, ...patch }));

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs transition-colors ${
      active
        ? "border-gold/60 bg-[rgba(201,162,39,0.14)] text-gold"
        : "border-line text-muted hover:border-line-strong hover:text-ink"
    }`;

  return (
    <div>
      {/* --- Поиск --- */}
      <div className="relative">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={filters.q}
          onChange={(event) => update({ q: event.target.value })}
          placeholder={t.characters.searchPlaceholder}
          aria-label={t.common.search}
          className="w-full rounded-full border border-line bg-surface py-3 pl-11 pr-4 text-ink outline-none transition-colors placeholder:text-faint focus:border-gold/60"
        />
      </div>

      {/* --- Фильтры --- */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => update({ house: "" })} className={chip(!filters.house)}>
          {t.common.all}
        </button>
        {HOUSES.map((house) => (
          <button
            key={house.slug}
            type="button"
            onClick={() => update({ house: filters.house === house.slug ? "" : house.slug })}
            className={chip(filters.house === house.slug)}
            style={
              filters.house === house.slug
                ? { borderColor: house.colors.secondary, color: house.colors.ink }
                : undefined
            }
          >
            {house.name[lang]}
          </button>
        ))}

        <span aria-hidden className="mx-1 h-4 w-px bg-[var(--border)]" />

        <button
          type="button"
          onClick={() => update({ role: filters.role === "student" ? "" : "student" })}
          className={chip(filters.role === "student")}
        >
          {t.characters.roleStudent}
        </button>
        <button
          type="button"
          onClick={() => update({ role: filters.role === "staff" ? "" : "staff" })}
          className={chip(filters.role === "staff")}
        >
          {t.characters.roleStaff}
        </button>
        <button
          type="button"
          onClick={() => update({ status: filters.status === "alive" ? "" : "alive" })}
          className={chip(filters.status === "alive")}
        >
          {t.characters.statusAlive}
        </button>
        <button
          type="button"
          onClick={() => update({ withImage: !filters.withImage })}
          className={chip(filters.withImage)}
        >
          {t.characters.filterImage}
        </button>

        <span aria-hidden className="mx-1 h-4 w-px bg-[var(--border)]" />

        <select
          value={filters.species}
          onChange={(event) => update({ species: event.target.value })}
          aria-label={t.characters.filterSpecies}
          className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted outline-none focus:border-gold/60"
        >
          <option value="">{t.characters.filterSpecies}: {t.common.all}</option>
          {facets.species.map((item) => (
            <option key={item.value} value={item.value}>
              {item.value} ({item.count})
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(event) => update({ sort: event.target.value })}
          aria-label={t.characters.sort}
          className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted outline-none focus:border-gold/60"
        >
          <option value="relevance">{t.characters.sortRelevance}</option>
          <option value="name">{t.characters.sortName}</option>
        </select>

        {!isDefault(filters) && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="rounded-full px-3 py-1.5 text-xs text-faint underline decoration-dotted underline-offset-4 hover:text-gold"
          >
            {t.characters.reset}
          </button>
        )}
      </div>

      {/* --- Строка состояния --- */}
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
        <p className="text-sm text-muted">
          {t.characters.found}: <span className="text-ink">{total}</span> {t.characters.results}
        </p>
        <DataSourceBadge source={source} t={t} />
      </div>

      {/* --- Результаты --- */}
      <div className="mt-6">
        {items.length === 0 && !loading ? (
          <div className="card px-6 py-16 text-center">
            <p className="font-[family-name:var(--font-display)] text-lg text-ink">
              {t.characters.noResults}
            </p>
            <p className="mt-2 text-sm text-muted">{t.characters.noResultsHint}</p>
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="seal-ghost mt-6"
            >
              {t.characters.reset}
            </button>
          </div>
        ) : (
          <CharacterGrid characters={items} lang={lang} t={t} priorityCount={5} headingLevel={2} />
        )}

        {loading && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton aspect-[3/4] rounded-[var(--radius)]" />
            ))}
          </div>
        )}

        {failed && (
          <div className="card mt-4 px-5 py-4 text-center text-sm">
            <p className="text-muted">{t.common.error}</p>
            <button
              type="button"
              onClick={() => void load(filters, page, false)}
              className="seal-ghost mt-3"
            >
              {t.common.retry}
            </button>
          </div>
        )}

        <div ref={sentinel} aria-hidden className="h-px" />

        {!hasMore && items.length > 0 && (
          <p className="mt-10 text-center text-sm text-faint">{t.characters.end}</p>
        )}
      </div>
    </div>
  );
}
