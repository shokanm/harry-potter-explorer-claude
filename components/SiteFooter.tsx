import type { Dictionary } from "@/lib/i18n/dict";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="relative z-10 mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-faint sm:px-6">
        <p>{t.footer.built}</p>
        <p className="mt-1.5">
          {t.footer.data}:{" "}
          <a
            href="https://hp-api.onrender.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="text-muted underline decoration-dotted underline-offset-4 hover:text-gold"
          >
            hp-api.onrender.com
          </a>
        </p>
        <p className="mt-3 text-xs">{t.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
