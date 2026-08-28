import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { SortingHatQuiz } from "@/components/SortingHatQuiz";
import { SORTING_QUESTIONS } from "@/lib/content/sorting-hat";
import { getDict } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Распределяющая шляпа",
  description: "Семь вопросов, и Шляпа назовёт ваш факультет собственным голосом.",
};

export default async function SortingHatPage() {
  const { lang, t } = await getDict();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        kicker={t.nav.sortingHat}
        title={t.sortingHat.title}
        subtitle={t.sortingHat.subtitle}
      />

      <div className="mt-9">
        <SortingHatQuiz questions={SORTING_QUESTIONS} lang={lang} t={t} />
      </div>
    </div>
  );
}
