import type { Metadata, Viewport } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";

import { Candles } from "@/components/Candles";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getDict } from "@/lib/i18n/server";

import "./globals.css";

const display = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const body = EB_Garamond({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Harry Potter Explorer",
    template: "%s · Harry Potter Explorer",
  },
  description:
    "Каталог персонажей, факультетов, заклинаний и артефактов волшебного мира. Данные — из Harry Potter API, все внешние вызовы идут через сервер.",
  applicationName: "Harry Potter Explorer",
  authors: [{ name: "Shokan Mustafa" }],
  openGraph: {
    title: "Harry Potter Explorer",
    description: "437 персонажей, 77 заклинаний, четыре факультета и двадцать один артефакт.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0906",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getDict();

  return (
    <html lang={lang} className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Candles />
        <SiteHeader lang={lang} t={t} />
        <main className="relative z-10 flex-1">{children}</main>
        <SiteFooter t={t} />
      </body>
    </html>
  );
}
