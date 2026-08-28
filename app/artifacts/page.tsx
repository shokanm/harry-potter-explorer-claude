import type { Metadata } from "next";

import { ArtifactShelf } from "@/components/ArtifactShelf";
import { PageHeader } from "@/components/PageHeader";
import { ARTIFACTS, ARTIFACT_CATEGORIES } from "@/lib/content/artifacts";
import { getDict } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Артефакты",
  description: "Дары Смерти, крестражи и реликвии Хогвартса — собственный курируемый каталог.",
};

export default async function ArtifactsPage() {
  const { lang, t } = await getDict();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        kicker={t.nav.artifacts}
        title={t.artifacts.title}
        subtitle={t.artifacts.subtitle}
      />

      <div className="mt-9">
        <ArtifactShelf
          artifacts={ARTIFACTS}
          categories={ARTIFACT_CATEGORIES}
          lang={lang}
          t={t}
        />
      </div>
    </div>
  );
}
