import type { Metadata } from "next";

import { DataSourceBadge } from "@/components/DataSourceBadge";
import { PageHeader } from "@/components/PageHeader";
import { SpellBook } from "@/components/SpellBook";
import { getSpells } from "@/lib/data-source";
import { getDict } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Заклинания",
  description: "77 заклинаний волшебного мира с описаниями и разделами.",
};

export default async function SpellsPage() {
  const { t } = await getDict();
  const { data, source } = await getSpells();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader kicker={t.nav.spells} title={t.spells.title} subtitle={t.spells.subtitle}>
        <div className="mt-5">
          <DataSourceBadge source={source} t={t} />
        </div>
      </PageHeader>

      <div className="mt-9">
        <SpellBook spells={data} t={t} />
      </div>
    </div>
  );
}
