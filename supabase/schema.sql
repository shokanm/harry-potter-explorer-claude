-- Harry Potter Explorer — схема Supabase.
-- Выполнить один раз в SQL Editor проекта Supabase, затем запустить `npm run sync`.

-- ─────────────────────────────────────────────────────────────
-- Справочники: зеркало данных из hp-api
-- ─────────────────────────────────────────────────────────────

-- Персонажи хранятся сырым JSON из upstream, а не разложенными колонками.
-- Причина: нормализация — это код приложения, и она меняется чаще схемы.
-- Держа raw, мы можем поменять правила разбора и не переливать базу.
create table if not exists public.characters (
  id          text primary key,
  name        text not null,
  house       text,
  raw         jsonb not null,
  updated_at  timestamptz not null default now()
);

create index if not exists characters_house_idx on public.characters (house);
create index if not exists characters_name_idx  on public.characters (lower(name));

create table if not exists public.spells (
  id          text primary key,
  name        text not null,
  description text not null default '',
  updated_at  timestamptz not null default now()
);

-- Артефакты написаны вручную и живут в репозитории; в базу их кладём,
-- чтобы все три раздела каталога читались из одного места.
create table if not exists public.artifacts (
  slug        text primary key,
  category    text not null,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Живые данные
-- ─────────────────────────────────────────────────────────────

-- Результаты Распределяющей шляпы. Ничего о посетителе не хранится:
-- только факультет и время — этого достаточно для общего счёта.
create table if not exists public.sorting_results (
  id         bigserial primary key,
  house      text not null check (house in ('gryffindor','slytherin','ravenclaw','hufflepuff')),
  created_at timestamptz not null default now()
);

create index if not exists sorting_results_created_idx on public.sorting_results (created_at desc);

-- Ограничитель частоты для маршрутов с LLM.
-- Ключ — усечённый SHA-256 от «соль + IP»: восстановить адрес по нему нельзя.
create table if not exists public.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  count        integer not null default 0,
  primary key (key, window_start)
);

create index if not exists rate_limits_window_idx on public.rate_limits (window_start);

-- Атомарный инкремент счётчика: без него два одновременных запроса
-- прочитали бы одно и то же значение и записали бы одно и то же +1.
create or replace function public.bump_rate_limit(p_key text, p_window_start timestamptz)
returns table (count integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.rate_limits (key, window_start, count)
  values (p_key, p_window_start, 1)
  on conflict (key, window_start)
    do update set count = public.rate_limits.count + 1
  returning public.rate_limits.count into count;
  return next;
end;
$$;

-- Уборка старых окон: таблица не должна расти вечно.
create or replace function public.prune_rate_limits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;

-- ─────────────────────────────────────────────────────────────
-- Права доступа
-- ─────────────────────────────────────────────────────────────
-- Анонимному ключу (им пользуется сервер для чтения) разрешено только
-- читать справочники и счёт. Любая запись идёт под service_role,
-- который существует исключительно в серверном окружении.

alter table public.characters      enable row level security;
alter table public.spells          enable row level security;
alter table public.artifacts       enable row level security;
alter table public.sorting_results enable row level security;
alter table public.rate_limits     enable row level security;

drop policy if exists "characters are readable" on public.characters;
create policy "characters are readable" on public.characters for select to anon, authenticated using (true);

drop policy if exists "spells are readable" on public.spells;
create policy "spells are readable" on public.spells for select to anon, authenticated using (true);

drop policy if exists "artifacts are readable" on public.artifacts;
create policy "artifacts are readable" on public.artifacts for select to anon, authenticated using (true);

drop policy if exists "sorting results are readable" on public.sorting_results;
create policy "sorting results are readable" on public.sorting_results for select to anon, authenticated using (true);

-- Для rate_limits политик нет вовсе: под анонимным ключом таблица недоступна,
-- а service_role обходит RLS по определению.

-- ─────────────────────────────────────────────────────────────
-- Realtime
-- ─────────────────────────────────────────────────────────────
-- Публикуем только счёт распределений: именно на него подписывается
-- серверный SSE-маршрут, чтобы толкать обновления в браузер.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'sorting_results'
  ) then
    alter publication supabase_realtime add table public.sorting_results;
  end if;
end $$;
