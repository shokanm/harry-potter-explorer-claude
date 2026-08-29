"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LangToggle } from "@/components/LangToggle";
import type { Dictionary } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/types";

/**
 * Шапка выпуска.
 *
 * Собрана как настоящая газетная: служебная строка с номером выпуска,
 * название крупной антиквой по центру, под ним двойная линейка и рубрики.
 * Рубрики разделены вертикальными штрихами, а не кнопками-таблетками —
 * в газете нет кнопок.
 */
export function SiteHeader({ lang, t }: { lang: Lang; t: Dictionary }) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/houses", label: t.nav.houses },
    { href: "/characters", label: t.nav.characters },
    { href: "/spells", label: t.nav.spells },
    { href: "/artifacts", label: t.nav.artifacts },
    { href: "/sorting-hat", label: t.nav.sortingHat },
    { href: "/favorites", label: t.nav.favorites },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="border-b border-rule-strong bg-paper">
      {/* Служебная строка выпуска */}
      <div className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6">
          <p className="font-[family-name:var(--font-label)] text-[0.62rem] uppercase tracking-[0.18em] text-faint">
            {lang === "ru" ? "Выпуск особый · цена 5 кнатов" : "Special edition · price 5 knuts"}
          </p>
          <LangToggle lang={lang} />
        </div>
      </div>

      {/* Название издания */}
      <div className="mx-auto max-w-6xl px-4 pb-3 pt-5 text-center sm:px-6">
        <Link href="/" className="inline-block">
          <span className="block font-[family-name:var(--font-display)] text-[1.7rem] font-bold uppercase leading-none tracking-[0.09em] text-ink sm:text-[2.6rem]">
            Harry Potter Explorer
          </span>
          <span className="mt-1.5 block font-[family-name:var(--font-label)] text-[0.6rem] uppercase tracking-[0.32em] text-faint sm:text-[0.68rem]">
            {t.tagline}
          </span>
        </Link>
      </div>

      {/* Рубрики */}
      <nav
        aria-label={t.nav.home}
        className="rule-double border-t border-rule-strong bg-paper"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ul className="flex items-center justify-start gap-0 overflow-x-auto py-1.5 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden">
            {links.map((link, index) => (
              <li key={link.href} className="flex shrink-0 items-center">
                {index > 0 && (
                  <span aria-hidden className="mx-0 h-3 w-px bg-[var(--rule)]" />
                )}
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`px-3 py-1 font-[family-name:var(--font-label)] text-[0.74rem] font-bold uppercase tracking-[0.13em] transition-colors ${
                    isActive(link.href)
                      ? "text-seal underline decoration-2 underline-offset-[6px]"
                      : "text-soft hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
