import type { Dictionary } from "@/lib/i18n/dict";
import type { DataSourceLayer } from "@/lib/types";

/**
 * Маленькая, но важная деталь: приложение показывает, из какого слоя пришли
 * данные. Это и честность перед читателем, и способ увидеть работу
 * отказоустойчивости своими глазами, не заглядывая в логи.
 */
export function DataSourceBadge({ source, t }: { source: DataSourceLayer; t: Dictionary }) {
  return (
    <span
      className="font-[family-name:var(--font-label)] text-[0.66rem] uppercase tracking-[0.14em] text-faint"
      title={t.source.hint}
    >
      {t.source.label}: <span className="text-seal">{t.source[source]}</span>
    </span>
  );
}
