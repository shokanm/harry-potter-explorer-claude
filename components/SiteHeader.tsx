"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LangToggle } from "@/components/LangToggle";
import type { Dictionary } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/types";

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
    <header className="sticky top-0 z-40 border-b border-line bg-[color-mix(in_srgb,var(--bg-deep)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-gold transition-transform group-hover:rotate-12"
          >
            {/* Знак Даров Смерти — самая узнаваемая графика вселенной. */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M12 3 21.5 20H2.5L12 3Z" strokeLinejoin="round" />
              <circle cx="12" cy="14.5" r="3.6" />
              <path d="M12 3v17" />
            </svg>
          </span>
          <span className="hidden font-[family-name:var(--font-display)] text-sm tracking-[0.14em] text-ink sm:block">
            HP&nbsp;EXPLORER
          </span>
        </Link>

        <nav
          aria-label={t.nav.home}
          // На узких экранах меню не помещается и прокручивается вбок.
          // Маска гасит правый край, чтобы обрезанный пункт читался как
          // «здесь есть продолжение», а не как сломанная вёрстка.
          className="-mx-1 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto px-1 [mask-image:linear-gradient(to_right,transparent,#000_12px,#000_calc(100%_-_28px),transparent)] [scrollbar-width:none] lg:[mask-image:none] [&::-webkit-scrollbar]:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[0.86rem] transition-colors ${
                isActive(link.href)
                  ? "bg-[rgba(201,162,39,0.14)] text-gold"
                  : "text-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="shrink-0">
          <LangToggle lang={lang} />
        </div>
      </div>
    </header>
  );
}
