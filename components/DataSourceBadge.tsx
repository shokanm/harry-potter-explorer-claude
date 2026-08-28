import type { Dictionary } from "@/lib/i18n/dict";
import type { DataSourceLayer } from "@/lib/types";

/**
 * Маленькая, но важная деталь: приложение показывает, из какого слоя
 * пришли данные. Это и честность перед пользователем, и способ увидеть
 * работу отказоустойчивости своими глазами, не заглядывая в логи.
 */
export function DataSourceBadge({ source, t }: { source: DataSourceLayer; t: Dictionary }) {
  const label = t.source[source];
  const tone =
    source === "supabase"
      ? "text-[#7fd4a0]"
      : source === "upstream"
        ? "text-gold"
        : "text-[#b48ad0]";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-faint" title={t.source.hint}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full bg-current ${tone}`} />
      {t.source.label}: <span className={tone}>{label}</span>
    </span>
  );
}
