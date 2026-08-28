"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Избранное («Омут памяти»).
 *
 * Хранится в localStorage — по условию задачи и потому, что это единственные
 * данные, которые принадлежат посетителю лично: на сервер они не уходят.
 *
 * Реализовано через useSyncExternalStore, а не useState + useEffect: так
 * список остаётся согласованным между всеми компонентами на странице
 * и между вкладками, а серверный рендер получает честный пустой снимок
 * вместо ошибки гидратации.
 */

const KEY = "hpx-favorites";

type Listener = () => void;

const listeners = new Set<Listener>();
let cache: string[] = [];
let cacheRaw: string | null = null;

function read(): string[] {
  if (typeof window === "undefined") return [];
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // Приватный режим или запрещённые куки — работаем без сохранения.
    return [];
  }
  // Пересобираем массив только если строка изменилась: getSnapshot обязан
  // возвращать стабильную ссылку, иначе React зациклится на перерисовках.
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      cache = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
      cache = [];
    }
  }
  return cache;
}

function write(next: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Не смогли сохранить — молча продолжаем, интерфейс не ломаем.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  // Событие storage приходит из других вкладок — так «Омут» общий для всего браузера.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const EMPTY: string[] = [];

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggle = useCallback((id: string) => {
    const current = read();
    write(current.includes(id) ? current.filter((v) => v !== id) : [id, ...current]);
  }, []);

  const clear = useCallback(() => write([]), []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, clear, has };
}
