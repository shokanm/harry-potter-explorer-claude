import { getCharacters } from "@/lib/data-source";
import { HOUSES } from "@/lib/content/houses";

/** GET /api/houses — справочник факультетов вместе с числом персонажей в базе. */
export const runtime = "nodejs";

export async function GET() {
  const { data, source } = await getCharacters();

  const items = HOUSES.map((house) => ({
    ...house,
    memberCount: data.filter((character) => character.house === house.slug).length,
  }));

  return Response.json({ items, source });
}
