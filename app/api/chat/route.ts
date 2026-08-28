import { getCharacterById } from "@/lib/data-source";
import { isLlmConfigured, MAX_HISTORY_TURNS, streamPersonaReply, type ChatTurn } from "@/lib/gemini";
import { isLang } from "@/lib/i18n/types";
import { rateLimit, visitorKey } from "@/lib/ratelimit";

/**
 * Разговор с портретом персонажа.
 *
 * POST { characterId, messages: [{ role, text }], lang }
 * Ответ — поток обычного текста (text/plain), который клиент дочитывает
 * по кускам. SSE здесь избыточен: нужен один однонаправленный поток без событий.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_MESSAGE_CHARS = 600;
const RATE_LIMIT = { limit: 12, windowSeconds: 300 };

interface ChatBody {
  characterId?: unknown;
  messages?: unknown;
  lang?: unknown;
}

function parseTurns(value: unknown): ChatTurn[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const turns: ChatTurn[] = [];
  for (const raw of value.slice(-MAX_HISTORY_TURNS)) {
    if (!raw || typeof raw !== "object") return null;
    const { role, text } = raw as { role?: unknown; text?: unknown };
    if (role !== "user" && role !== "model") return null;
    if (typeof text !== "string") return null;
    const trimmed = text.trim();
    if (!trimmed) return null;
    turns.push({ role, text: trimmed.slice(0, MAX_MESSAGE_CHARS) });
  }

  // Последней всегда должна быть реплика посетителя — иначе отвечать не на что.
  if (turns[turns.length - 1].role !== "user") return null;
  return turns;
}

export async function POST(request: Request) {
  if (!isLlmConfigured()) {
    return Response.json({ error: "llm_not_configured" }, { status: 503 });
  }

  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  const characterId = typeof body.characterId === "string" ? body.characterId : null;
  const turns = parseTurns(body.messages);
  const lang = isLang(body.lang) ? body.lang : "ru";

  if (!characterId || !turns) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const key = await visitorKey(request);
  const limit = await rateLimit(`chat:${key}`, RATE_LIMIT);
  if (!limit.allowed) {
    return Response.json(
      { error: "rate_limited", resetInSeconds: limit.resetInSeconds },
      { status: 429, headers: { "retry-after": String(limit.resetInSeconds) } },
    );
  }

  const { data: character } = await getCharacterById(characterId);
  if (!character) {
    return Response.json({ error: "character_not_found" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamPersonaReply(character, turns, lang, {
          signal: request.signal,
        })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        // Поток уже открыт, статус-код не изменить: сообщаем словами.
        console.error("[chat] сбой генерации:", error);
        const message =
          lang === "ru"
            ? "\n\n…портрет внезапно умолк. Попробуйте ещё раз."
            : "\n\n…the portrait has fallen silent. Try again.";
        controller.enqueue(encoder.encode(message));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-rate-remaining": String(limit.remaining),
    },
  });
}
