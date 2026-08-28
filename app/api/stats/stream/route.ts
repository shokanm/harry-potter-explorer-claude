import { readSortingTally } from "@/lib/sorting-tally";
import { isSupabaseConfigured, supabaseRead } from "@/lib/supabase/server";

/**
 * Живой счётчик распределений — Server-Sent Events.
 *
 * Почему не подписка Supabase Realtime прямо из браузера, как в их примерах:
 * ТЗ требует, чтобы к внешним сервисам ходил сервер. Поэтому на Supabase
 * подписывается серверный маршрут, а браузеру отдаёт свой поток с этого же
 * домена. Побочная выгода — браузер не знает ни адреса проекта, ни ключа.
 *
 * Соединение живёт около сорока секунд и закрывается само: бессрочные
 * соединения плохо уживаются с серверлесс-хостингом, а EventSource
 * переподключается сам, и для пользователя разрыв незаметен.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LIFETIME_MS = 40_000;
/** Страховка на случай, если realtime-канал не поднялся: тихий опрос. */
const POLL_MS = 8_000;

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      let lastPayload = "";

      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      const push = async () => {
        const tally = await readSortingTally();
        const payload = JSON.stringify(tally.byHouse) + tally.total;
        if (payload === lastPayload) return;
        lastPayload = payload;
        send("tally", tally);
      };

      await push();

      const channel = isSupabaseConfigured()
        ? supabaseRead()
            ?.channel("sorting-live")
            .on(
              "postgres_changes",
              { event: "INSERT", schema: "public", table: "sorting_results" },
              () => {
                void push();
              },
            )
            .subscribe()
        : null;

      const poll = setInterval(() => void push(), POLL_MS);
      // Комментарий-пинг не даёт прокси закрыть «молчащее» соединение.
      const ping = setInterval(() => {
        if (!closed) {
          try {
            controller.enqueue(encoder.encode(": ping\n\n"));
          } catch {
            closed = true;
          }
        }
      }, 15_000);

      const shutdown = () => {
        if (closed) return;
        closed = true;
        clearInterval(poll);
        clearInterval(ping);
        if (channel) void supabaseRead()?.removeChannel(channel);
        try {
          controller.close();
        } catch {
          // соединение уже разорвано клиентом
        }
      };

      const lifetime = setTimeout(shutdown, LIFETIME_MS);
      request.signal.addEventListener("abort", () => {
        clearTimeout(lifetime);
        shutdown();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store, no-transform",
      connection: "keep-alive",
      // Отключает буферизацию у обратных прокси вроде nginx.
      "x-accel-buffering": "no",
    },
  });
}
