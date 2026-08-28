import { getCharacterById } from "@/lib/data-source";
import { toPublic } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, source } = await getCharacterById(id);

  if (!data) {
    return Response.json({ error: "character_not_found", id }, { status: 404 });
  }

  return Response.json({ character: toPublic(data), source });
}
