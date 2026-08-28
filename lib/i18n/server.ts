import "server-only";

import { cookies } from "next/headers";

import { dict, type Dictionary } from "@/lib/i18n/dict";
import { DEFAULT_LANG, isLang, type Lang } from "@/lib/i18n/types";

/**
 * Язык хранится в cookie, а не в URL.
 *
 * Вариант с /ru/... и /en/... был бы каноничнее для SEO, но удваивает дерево
 * маршрутов ради двух языков в учебном проекте. Cookie позволяет серверным
 * компонентам рендерить уже переведённую страницу — без мигания английским
 * текстом перед гидратацией, чем грешит чисто клиентская локализация.
 */
export const LANG_COOKIE = "hpx-lang";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

export async function getDict(): Promise<{ lang: Lang; t: Dictionary }> {
  const lang = await getLang();
  return { lang, t: dict(lang) };
}
