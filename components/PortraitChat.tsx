"use client";

import { useEffect, useRef, useState } from "react";

import type { Dictionary } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/types";

interface Message {
  role: "user" | "model";
  text: string;
}

/**
 * Разговор с портретом.
 *
 * Ответ приходит потоком обычного текста с нашего же /api/chat: ключа Gemini
 * в браузере нет и быть не может. Читаем поток вручную через ReadableStream —
 * так первые слова появляются через доли секунды, а не после всего ответа.
 */
export function PortraitChat({
  characterId,
  characterName,
  lang,
  t,
  available,
  suggestions,
}: {
  characterId: string;
  characterName: string;
  lang: Lang;
  t: Dictionary;
  available: boolean;
  suggestions: string[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scroller = useRef<HTMLDivElement | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => () => abort.current?.abort(), []);

  async function send(text: string) {
    const question = text.trim();
    if (!question || streaming) return;

    const history: Message[] = [...messages, { role: "user", text: question }];
    setMessages(history);
    setInput("");
    setError(null);
    setStreaming(true);

    // Пустой ответ портрета — в него будем дописывать куски по мере получения.
    setMessages([...history, { role: "model", text: "" }]);

    const controller = new AbortController();
    abort.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ characterId, messages: history, lang }),
        signal: controller.signal,
      });

      if (response.status === 429) {
        setMessages(history);
        setError(t.chat.rateLimited);
        return;
      }
      if (response.status === 503) {
        setMessages(history);
        setError(t.chat.unavailable);
        return;
      }
      if (!response.ok || !response.body) throw new Error(`http ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assembled = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        assembled += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "model", text: assembled }]);
      }

      if (!assembled.trim()) {
        setMessages(history);
        setError(t.chat.error);
      }
    } catch (caught) {
      if ((caught as Error).name === "AbortError") return;
      setMessages(history);
      setError(t.chat.error);
    } finally {
      setStreaming(false);
      abort.current = null;
    }
  }

  if (!available) {
    return (
      <div className="notice p-5 text-sm text-soft">
        <p>{t.chat.unavailable}</p>
      </div>
    );
  }

  return (
    <div className="notice">
      <div
        ref={scroller}
        className="max-h-[26rem] min-h-[9rem] overflow-y-auto px-5 py-4"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 ? (
          <div className="py-2">
            <p className="text-[0.95rem] text-soft">{t.character.chatSubtitle}</p>
            <p className="kicker mt-5">{t.chat.suggestions}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="border border-rule px-3 py-1.5 text-left text-[0.82rem] text-soft transition-colors hover:border-ink hover:text-ink"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {messages.map((message, index) => (
              <li
                key={index}
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[86%] px-4 py-2.5 text-[0.95rem] leading-relaxed ${
                    message.role === "user"
                      ? "border border-rule bg-paper-deep text-ink"
                      : "border-l-[3px] border-seal bg-paper-white pl-4 text-ink"
                  }`}
                >
                  {message.role === "model" && (
                    <p className="kicker mb-1">{characterName}</p>
                  )}
                  {message.text || (
                    <span className="inline-flex items-center gap-1.5 text-faint">
                      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-seal" />
                      {t.chat.thinking}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="mt-4 text-sm text-seal">{error}</p>}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
        className="flex items-center gap-2 border-t border-rule p-3"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t.chat.placeholder}
          maxLength={600}
          disabled={streaming}
          aria-label={t.chat.placeholder}
          className="min-w-0 flex-1 border border-rule bg-paper px-3 py-2 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-faint focus:border-seal disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="stamp shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.chat.send}
        </button>
      </form>

      <p className="caption border-t border-rule px-4 py-2.5">{t.chat.disclaimer}</p>
    </div>
  );
}
