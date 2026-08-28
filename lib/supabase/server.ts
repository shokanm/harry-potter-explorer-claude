import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Клиенты Supabase. Оба — серверные.
 *
 * Обратите внимание на имена переменных: ни одной с префиксом NEXT_PUBLIC_.
 * Браузер не знает ни адреса проекта, ни анонимного ключа — даже realtime-поток
 * идёт к нему через наш собственный SSE-эндпоинт. Так требование ТЗ
 * «внешние сервисы только с сервера» выполняется без единого исключения.
 */

const URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(URL && ANON_KEY);
}

export function canWriteToSupabase(): boolean {
  return Boolean(URL && SERVICE_KEY);
}

let readClient: SupabaseClient | null = null;
let writeClient: SupabaseClient | null = null;

/** Чтение справочников: анонимный ключ, RLS разрешает только SELECT. */
export function supabaseRead(): SupabaseClient | null {
  if (!URL || !ANON_KEY) return null;
  if (!readClient) {
    readClient = createClient(URL, ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return readClient;
}

/** Запись: service_role, живёт только в серверном рантайме. */
export function supabaseAdmin(): SupabaseClient | null {
  if (!URL || !SERVICE_KEY) return null;
  if (!writeClient) {
    writeClient = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return writeClient;
}
