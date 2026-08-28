import type { Metadata } from "next";

import { FavoritesList } from "@/components/FavoritesList";
import { PageHeader } from "@/components/PageHeader";
import { getDict } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Избранное",
  description: "Отложенные персонажи. Хранятся в браузере и никуда не отправляются.",
};

export default async function FavoritesPage() {
  const { lang, t } = await getDict();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        kicker={t.nav.favorites}
        title={t.favorites.title}
        subtitle={t.favorites.subtitle}
      />

      <div className="mt-9">
        <FavoritesList lang={lang} t={t} />
      </div>
    </div>
  );
}
