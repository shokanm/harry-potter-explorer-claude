import { ARTIFACTS, ARTIFACT_CATEGORIES } from "@/lib/content/artifacts";

/**
 * Артефакты — собственный датасет.
 *
 * В hp-api эндпоинта артефактов нет вообще, хотя ТЗ их требует. Данные
 * написаны вручную и лежат в репозитории, но отдаются через тот же
 * серверный API, что и остальное, — чтобы у клиента был один способ
 * получать данные, а не два.
 */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const items = category ? ARTIFACTS.filter((a) => a.category === category) : ARTIFACTS;

  return Response.json({ items, total: items.length, categories: ARTIFACT_CATEGORIES });
}
