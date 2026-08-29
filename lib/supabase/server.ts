import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { envFirst, envOrNull } from "@/lib/env";

/**
 * Клиенты Supabase. Оба — серверные.
 *
 * Обратите внимание на имена переменных: ни одной с префиксом NEXT_PUBLIC_.
 * Браузер не знает ни адреса проекта, ни анонимного ключа — даже realtime-поток
 * идёт к нему через наш собственный SSE-эндпоинт. Так требование ТЗ
 * «внешние сервисы только с сервера» выполняется без единого исключения.
 */

// envFirst/envOrNull, а не process.env напрямую: переменная, заданная пустой
// строкой, должна считаться незаданной, иначе createClient получит "" и упадёт.
//
// Имён по два, потому что Supabase переименовал ключи. Новые проекты выдают
// sb_publishable_… и sb_secret_…, у старых остались anon и service_role.
// Роль в базе от этого не меняется: publishable по-прежнему ходит как anon,
// secret — как service_role, поэтому политики RLS в schema.sql верны для обоих.
const URL = envOrNull("SUPABASE_URL");
const PUBLISHABLE_KEY = envFirst(["SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY"]);
const SERVICE_KEY = envFirst(["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"]);

/**
 * Ключ для чтения.
 *
 * Правильнее читать публикуемым ключом: он ограничен политиками RLS и не может
 * ничего испортить, даже если в запрос однажды просочится пользовательский ввод.
 * Но требовать оба ключа ради этого — лишний барьер на установке, поэтому при
 * отсутствии публикуемого читаем секретным.
 *
 * Риск здесь мал: все запросы к Supabase — фиксированные выборки без подстановки
 * пользовательских данных. Но если публикуемый ключ у вас есть, задайте его:
 * меньше прав у ключа — меньше последствий у будущей ошибки.
 */
const READ_KEY = PUBLISHABLE_KEY ?? SERVICE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(URL && READ_KEY);
}

/** Читаем ли мы ключом с правом записи. Видно в диагностике — не молча. */
export function isReadingWithPrivilegedKey(): boolean {
  return Boolean(URL && !PUBLISHABLE_KEY && SERVICE_KEY);
}

export function canWriteToSupabase(): boolean {
  return Boolean(URL && SERVICE_KEY);
}

let readClient: SupabaseClient | null = null;
let writeClient: SupabaseClient | null = null;

/** Чтение справочников: анонимный ключ, RLS разрешает только SELECT. */
export function supabaseRead(): SupabaseClient | null {
  if (!URL || !READ_KEY) return null;
  if (!readClient) {
    readClient = createClient(URL, READ_KEY, {
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
