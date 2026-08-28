import type { Metadata } from "next";

import { CharacterCatalog, EMPTY_FILTERS, type CatalogFilters } from "@/components/CharacterCatalog";
import { PageHeader } from "@/components/PageHeader";
import { getCharacters } from "@/lib/data-source";
import { buildFacets } from "@/lib/facets";
import { selectCharacters, type CharacterFilters } from "@/lib/fuzzy";
import { getDict } from "@/lib/i18n/server";
import { toPublicList } from "@/lib/serialize";

const PAGE_SIZE = 24;

function readFilters(params: Record<string, string | string[] | undefined>): CatalogFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };

  return {
    ...EMPTY_FILTERS,
    q: one("q"),
    house: one("house"),
    species: one("species"),
    role: one("role"),
    status: one("status"),
    withImage: one("withImage") === "1",
    sort: one("sort") || "relevance",
  };
}

/**
 * Первую страницу каталога собирает сервер — он вызывает слой данных напрямую,
 * без похода в собственный HTTP-роут. Посетитель получает готовую разметку
 * с результатами, а не пустую сетку, которая заполнится после гидратации.
 * Дальше подгрузкой занимается клиент через /api/characters.
 */
/** Заголовок вкладки тоже переводится — язык берётся из той же cookie. */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.characters.title, description: t.meta.characters };
}

export default async function CharactersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang, t } = await getDict();
  const filters = readFilters(await searchParams);

  const { data, source } = await getCharacters();
  const selected = selectCharacters(data, filters as CharacterFilters);
  const firstPage = selected.slice(0, PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        kicker={t.nav.characters}
        title={t.characters.title}
        subtitle={t.characters.subtitle}
      />

      <div className="mt-8">
        <CharacterCatalog
          lang={lang}
          t={t}
          initialFilters={filters}
          initialItems={toPublicList(firstPage)}
          initialTotal={selected.length}
          initialHasMore={selected.length > firstPage.length}
          initialSource={source}
          facets={buildFacets(data)}
        />
      </div>
    </div>
  );
}
