import Link from "next/link";

import { getDict } from "@/lib/i18n/server";

export default async function NotFound() {
  const { lang, t } = await getDict();

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="kicker">404</p>
      <h1 className="rule-hair mt-4 text-4xl sm:text-5xl">
        {lang === "ru" ? "Эта дверь никуда не ведёт" : "This door leads nowhere"}
      </h1>
      <p className="mt-6 max-w-md text-soft">
        {lang === "ru"
          ? "Лестницы Хогвартса иногда меняют направление. Похоже, одна из них увела вас не туда."
          : "The staircases at Hogwarts like to change. One of them appears to have taken you somewhere else."}
      </p>
      <Link href="/" className="stamp mt-9">
        {t.nav.home}
      </Link>
    </div>
  );
}
