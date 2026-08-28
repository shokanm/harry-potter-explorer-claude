import { CharacterCard } from "@/components/CharacterCard";
import type { Dictionary } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/types";
import type { PublicCharacter } from "@/lib/serialize";

export function CharacterGrid({
  characters,
  lang,
  t,
  priorityCount = 0,
}: {
  characters: PublicCharacter[];
  lang: Lang;
  t: Dictionary;
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {characters.map((character, index) => (
        <CharacterCard
          key={character.id}
          character={character}
          lang={lang}
          t={t}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
