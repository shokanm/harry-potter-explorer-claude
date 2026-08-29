import type { Dictionary } from "@/lib/i18n/dict";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="mt-20 border-t-[3px] border-double border-rule-strong">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="font-[family-name:var(--font-label)] text-[0.7rem] uppercase tracking-[0.16em] text-soft">
          {t.footer.built}
        </p>
        <p className="caption mt-2">
          {t.footer.data}:{" "}
          <a
            href="https://hp-api.onrender.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-dotted underline-offset-2 hover:text-seal"
          >
            hp-api.onrender.com
          </a>
        </p>
        <p className="caption mt-3">{t.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
