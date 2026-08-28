import "server-only";

import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Ограничение частоты обращений к платным маршрутам (LLM).
 *
 * Стенд публичный, ключ Gemini — на бесплатном тарифе с суточной квотой.
 * Без ограничителя один любопытный посетитель выжигает квоту за вечер,
 * и жюри открывает мёртвую демонстрацию.
 *
 * Хранилище — та же Supabase, отдельный Redis ради двух счётчиков не нужен.
 * Без Supabase работает счётчик в памяти процесса: на одном инстансе он честен,
 * на нескольких — приблизителен, что для защиты от случайного перебора достаточно.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, resetInSeconds: windowSeconds };
  }

  bucket.count += 1;
  const resetInSeconds = Math.ceil((bucket.resetAt - now) / 1000);
  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetInSeconds,
  };
}

/**
 * Ключ посетителя. Берём IP из заголовков прокси и сразу хэшируем:
 * в базе не должно лежать ничего, что само по себе указывает на человека.
 */
export async function visitorKey(request: Request): Promise<string> {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";

  const salt = process.env.RATE_LIMIT_SALT ?? "hpx";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest).slice(0, 12))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function rateLimit(
  key: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number },
): Promise<RateLimitResult> {
  const client = supabaseAdmin();
  if (!client) return memoryLimit(key, limit, windowSeconds);

  const windowStart = new Date(Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000);

  try {
    // Одна строка на пару «посетитель + окно»: конфликт по первичному ключу
    // означает, что окно уже начато, и счётчик нужно увеличить.
    const { data, error } = await client
      .rpc("bump_rate_limit", {
        p_key: key,
        p_window_start: windowStart.toISOString(),
      })
      .single<{ count: number }>();

    if (error || !data) return memoryLimit(key, limit, windowSeconds);

    const resetInSeconds = Math.ceil(
      (windowStart.getTime() + windowSeconds * 1000 - Date.now()) / 1000,
    );
    return {
      allowed: data.count <= limit,
      remaining: Math.max(0, limit - data.count),
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  } catch {
    return memoryLimit(key, limit, windowSeconds);
  }
}
