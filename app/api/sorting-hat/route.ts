import { HOUSE_BY_SLUG } from "@/lib/content/houses";
import { SORTING_QUESTIONS, scoreAnswers } from "@/lib/content/sorting-hat";
import { isLlmConfigured, streamHatVerdict } from "@/lib/gemini";
import { isLang, type Lang } from "@/lib/i18n/types";
import { rateLimit, visitorKey } from "@/lib/ratelimit";
import { recordSorting } from "@/lib/sorting-tally";

/**
 * Распределение.
 *
 * Факультет считается здесь, на сервере, обычной арифметикой по ответам —
 * и уходит клиенту заголовком x-house сразу, до первого слова речи. Модель
 * лишь озвучивает готовое решение потоком. Поэтому исчерпанная квота Gemini
 * лишает Шляпу голоса, но не способности распределять.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const RATE_LIMIT = { limit: 8, windowSeconds: 300 };

function summarize(answers: Record<string, string>, lang: Lang): string {
  const lines: string[] = [];
  for (const question of SORTING_QUESTIONS) {
    const chosen = question.options.find((option) => option.id === answers[question.id]);
    if (!chosen) continue;
    lines.push(`- ${question.text[lang]} → ${chosen.text[lang]}`);
  }
  return lines.join("\n");
}

export async function POST(request: Request) {
  let answers: Record<string, string>;
  let lang: Lang;

  try {
    const body = (await request.json()) as { answers?: unknown; lang?: unknown };
    if (!body.answers || typeof body.answers !== "object") throw new Error("bad answers");
    answers = Object.fromEntries(
      Object.entries(body.answers as Record<string, unknown>)
        .filter(([, v]) => typeof v === "string")
        .map(([k, v]) => [k, v as string]),
    );
    lang = isLang(body.lang) ? body.lang : "ru";
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const answered = SORTING_QUESTIONS.filter((q) => answers[q.id]).length;
  if (answered < SORTING_QUESTIONS.length) {
    return Response.json({ error: "incomplete", answered }, { status: 400 });
  }

  const { house, scores } = scoreAnswers(answers);
  const persisted = await recordSorting(house);

  const headers: Record<string, string> = {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
    "x-house": house,
    "x-scores": JSON.stringify(scores),
    "x-persisted": persisted ? "1" : "0",
  };

  // Без ключа или при переборе запросов возвращаем факультет с пустой речью:
  // интерфейс покажет свой текст и не станет делать вид, что что-то сломалось.
  const key = await visitorKey(request);
  const limit = await rateLimit(`hat:${key}`, RATE_LIMIT);

  if (!isLlmConfigured() || !limit.allowed) {
    return new Response("", { headers: { ...headers, "x-voice": "silent" } });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamHatVerdict(
          // Название на языке интерфейса, а не английское: иначе Шляпа
          // переведёт его сама и разойдётся с подписью на экране.
          HOUSE_BY_SLUG[house].name[lang],
          summarize(answers, lang),
          lang,
          { signal: request.signal },
        )) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        console.error("[sorting-hat] сбой генерации:", error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { ...headers, "x-voice": "spoken" } });
}
