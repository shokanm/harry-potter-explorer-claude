"use server";

import { cookies } from "next/headers";

import { LANG_COOKIE } from "@/lib/i18n/server";
import { isLang } from "@/lib/i18n/types";

/** Переключение языка. Cookie на год, path "/" — чтобы держалось на всех страницах. */
export async function setLanguage(value: string): Promise<void> {
  if (!isLang(value)) return;
  const store = await cookies();
  store.set(LANG_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
