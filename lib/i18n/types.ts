export const LANGS = ["ru", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ru";

/** Строка, у которой есть обе версии. Весь авторский контент хранится так. */
export type Localized = Record<Lang, string>;

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** Безопасно достать строку нужного языка с откатом на русский. */
export function pick(value: Localized | undefined, lang: Lang): string {
  if (!value) return "";
  return value[lang] ?? value[DEFAULT_LANG] ?? "";
}
