import { getSpells } from "@/lib/data-source";
import { normalizeQuery } from "@/lib/fuzzy";

/** GET /api/spells?q=&category= — поиск и фильтр по выведенной на сервере категории. */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = normalizeQuery(searchParams.get("q") ?? "");
  const category = searchParams.get("category");

  const { data, source } = await getSpells();

  let items = data;
  if (category) items = items.filter((spell) => spell.category === category);
  if (q) {
    items = items.filter(
      (spell) =>
        spell.name.toLowerCase().includes(q) || spell.description.toLowerCase().includes(q),
    );
  }

  return Response.json({ items, total: items.length, source });
}
