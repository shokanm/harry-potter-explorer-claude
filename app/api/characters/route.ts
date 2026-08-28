import { getCharacters } from "@/lib/data-source";
import { buildFacets } from "@/lib/facets";
import { selectCharacters, type CharacterFilters } from "@/lib/fuzzy";
import { toPublicList } from "@/lib/serialize";

/**
 * Каталог персонажей.
 *
 * Внешний hp-api не умеет ни искать, ни отдавать страницами — он присылает
 * все 437 записей одним массивом. Поэтому фильтрация, ранжирование и нарезка
 * на страницы происходят здесь: клиент получает ровно то, что показывает.
 *
 * GET /api/characters?q=&house=&species=&role=&status=&withImage=&sort=&page=&limit=
 * GET /api/characters?ids=a,b,c — выборка по списку (нужна «Омуту памяти»,
 *   чтобы получить все отложенные карточки одним запросом, а не десятью).
 */
export const runtime = "nodejs";

const MAX_LIMIT = 60;
const DEFAULT_LIMIT = 24;

function intParam(value: string | null, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters: CharacterFilters = {
    q: searchParams.get("q") ?? undefined,
    house: searchParams.get("house") ?? undefined,
    species: searchParams.get("species") ?? undefined,
    role: (searchParams.get("role") as CharacterFilters["role"]) ?? undefined,
    status: (searchParams.get("status") as CharacterFilters["status"]) ?? undefined,
    hasImage: searchParams.get("withImage") === "1",
    sort: (searchParams.get("sort") as CharacterFilters["sort"]) ?? undefined,
  };

  const page = intParam(searchParams.get("page"), 1, 1, 1000);
  const limit = intParam(searchParams.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);

  const { data, source } = await getCharacters();

  // Режим выборки по id: порядок сохраняем тот, что прислал клиент, —
  // в «Омуте» карточки лежат в порядке добавления, и он не должен меняться.
  const idsParam = searchParams.get("ids");
  if (idsParam !== null) {
    const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 200);
    const byId = new Map(data.map((character) => [character.id, character]));
    const found = ids.map((id) => byId.get(id)).filter((c) => c !== undefined);

    return Response.json(
      {
        items: toPublicList(found),
        page: 1,
        limit: found.length,
        total: found.length,
        hasMore: false,
        source,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const selected = selectCharacters(data, filters);

  const start = (page - 1) * limit;
  const items = selected.slice(start, start + limit);

  return Response.json(
    {
      items: toPublicList(items),
      page,
      limit,
      total: selected.length,
      hasMore: start + items.length < selected.length,
      source,
      facets: page === 1 ? buildFacets(data) : undefined,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
