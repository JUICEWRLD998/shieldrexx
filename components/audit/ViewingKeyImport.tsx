"use client";

import { useRef, useState } from "react";

interface Props {
  onImport: (keyJson: string) => void;
  isError: boolean;
  errorMessage: string | null;
}

export function ViewingKeyImport({ onImport, isError, errorMessage }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    onImport(value);
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setValue(text);
    } catch {
      // Browser blocked clipboard — user can type/paste manually
      textareaRef.current?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="step-num uppercase tracking-widest mb-0.5">Step 1</p>
          <p className="text-slate-200 font-semibold text-sm">Paste your viewing key</p>
        </div>
        <button
          onClick={handlePaste}
          className="btn-secondary text-xs py-2 px-4"
        >
          Paste from clipboard
        </button>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
          rows={6}
          placeholder='{"batchEntries":[{"wallet":"...","amount":500,"token":"USDC","txSignature":"..."}]}'
          className="w-full rounded-xl font-mono text-xs leading-relaxed resize-none focus:outline-none transition-colors"
          style={{
            background: "rgba(13,18,48,0.85)",
            border: isError
              ? "1px solid rgba(239,68,68,0.5)"
              : "1px solid rgba(124,58,237,0.25)",
            color: "#94a3b8",
            padding: "14px 16px",
          }}
          aria-label="Viewing key JSON input"
          aria-invalid={isError}
          aria-describedby={isError ? "vk-error" : undefined}
        />
        {value.length > 0 && (
          <button
            onClick={() => setValue("")}
            className="absolute top-2.5 right-3 text-slate-600 hover:text-slate-400 text-xs transition-colors"
            aria-label="Clear input"
          >
            ✕
          </button>
        )}
      </div>

      {/* Error */}
      {isError && errorMessage && (
        <div
          id="vk-error"
          className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
          }}
          role="alert"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.5" />
            <path d="M12 8v4m0 4h.01" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {errorMessage}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="btn-primary w-full sm:w-auto sm:self-end disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        Decrypt Batch →
      </button>
    </div>
  );
}
