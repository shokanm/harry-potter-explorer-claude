#!/usr/bin/env node
/**
 * Выгрузка данных в Supabase.
 *
 * Читает hp-api (при недоступности — снапшот из репозитория) и заливает
 * персонажей, заклинания и артефакты в базу. После этого приложение начинает
 * читать первый слой источника вместо чужого бесплатного хостинга.
 *
 * Запуск: npm run sync
 * Нужны переменные SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY (см. .env.example).
 */
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const BASE = process.env.HP_API_BASE_URL ?? "https://hp-api.onrender.com/api";
const BATCH = 200;

function need(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`✘ Не задана переменная ${name}. Скопируйте .env.example в .env.local и заполните.`);
    process.exit(1);
  }
  return value;
}

/** hp-api спит на бесплатном Render — даём ему время проснуться, но не бесконечно. */
async function fetchWithTimeout(url, ms = 60_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function load(path, snapshotFile) {
  try {
    process.stdout.write(`  ↓ ${BASE}${path} … `);
    const data = await fetchWithTimeout(`${BASE}${path}`);
    console.log(`${data.length} записей`);
    return data;
  } catch (error) {
    console.log(`недоступен (${error.message})`);
    const raw = JSON.parse(await readFile(join(ROOT, "data", snapshotFile), "utf8"));
    console.log(`  ↳ беру снапшот от ${raw.capturedAt}: ${raw.items.length} записей`);
    return raw.items;
  }
}

async function upsert(client, table, rows, conflictColumn) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await client.from(table).upsert(chunk, { onConflict: conflictColumn });
    if (error) throw new Error(`${table}: ${error.message}`);
    process.stdout.write(`\r  ↑ ${table}: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
  console.log("");
}

async function main() {
  const url = need("SUPABASE_URL");
  const key = need("SUPABASE_SERVICE_ROLE_KEY");
  const client = createClient(url, key, { auth: { persistSession: false } });

  console.log("Загружаю данные из источника:");
  const [characters, spells] = await Promise.all([
    load("/characters", "characters.snapshot.json"),
    load("/spells", "spells.snapshot.json"),
  ]);

  // Артефакты лежат в TypeScript-модуле, а скрипт на чистом JS.
  // Разбирать TS ради статического списка не стоит — читаем его как текст
  // только чтобы посчитать, и заливаем из собранного JSON.
  const artifactsJson = JSON.parse(
    await readFile(join(ROOT, "data", "artifacts.json"), "utf8"),
  );

  console.log("\nЗаливаю в Supabase:");

  await upsert(
    client,
    "characters",
    characters.map((c) => ({ id: c.id, name: c.name, house: c.house || null, raw: c })),
    "id",
  );

  await upsert(
    client,
    "spells",
    spells.map((s) => ({ id: s.id, name: s.name, description: s.description ?? "" })),
    "id",
  );

  await upsert(
    client,
    "artifacts",
    artifactsJson.map((a) => ({ slug: a.slug, category: a.category, data: a })),
    "slug",
  );

  console.log("\n✔ Готово. Приложение теперь читает Supabase как основной слой.");
}

main().catch((error) => {
  console.error(`\n✘ ${error.message}`);
  process.exit(1);
});
