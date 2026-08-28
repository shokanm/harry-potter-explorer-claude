import { ARTIFACTS } from "@/lib/content/artifacts";
import { getCatalogStats, getSpells } from "@/lib/data-source";
import { readSortingTally } from "@/lib/sorting-tally";

/** GET /api/stats — сводка для главной: каталог плюс живой счёт Шляпы. */
export const runtime = "nodejs";

export async function GET() {
  const [catalog, spells, tally] = await Promise.all([
    getCatalogStats(),
    getSpells(),
    readSortingTally(),
  ]);

  return Response.json(
    {
      catalog: { ...catalog, spells: spells.data.length, artifacts: ARTIFACTS.length },
      sorting: tally,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
