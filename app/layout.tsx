import type { Metadata, Viewport } from "next";
import { Old_Standard_TT, PT_Sans_Narrow, PT_Serif } from "next/font/google";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getDict } from "@/lib/i18n/server";

import "./globals.css";

/**
 * Гарнитуры подобраны под газетную полосу и, что важнее, все три умеют
 * кириллицу: интерфейс русский по умолчанию, и «красивый шрифт без русских
 * букв» здесь не вариант.
 */
const display = Old_Standard_TT({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = PT_Serif({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const label = PT_Sans_Narrow({
  variable: "--font-label",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
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
  themeColor: "#f4f0e6",
  colorScheme: "light",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getDict();

  return (
    <html lang={lang} className={`${display.variable} ${body.variable} ${label.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader lang={lang} t={t} />
        <main className="flex-1">{children}</main>
        <SiteFooter t={t} />
      </body>
    </html>
  );
}
