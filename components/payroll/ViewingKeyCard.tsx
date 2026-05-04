"use client";

import { useState } from "react";
import type { BatchResult } from "@/types";
import { SOLSCAN_TX_URL } from "@/lib/constants";

interface Props {
  result: BatchResult;
}

export function ViewingKeyCard({ result }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyKey() {
    navigator.clipboard.writeText(result.viewingKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadKey() {
    const blob = new Blob([result.viewingKey], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shieldrexx-viewing-key-${result.timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="card rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(13,18,48,0.98) 0%, rgba(40,20,80,0.5) 100%)" }}
      role="region"
      aria-label="Batch success and viewing key"
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid rgba(124,58,237,0.2)", background: "rgba(34,197,94,0.05)" }}
      >
        {/* Success dot */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M5 13l4 4L19 7" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-sm">Batch sent privately</p>
          <p className="text-slate-500 text-xs">
            {result.entries.length} recipient{result.entries.length !== 1 ? "s" : ""} ·{" "}
            {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
        {/* Solscan link */}
        <a
          href={SOLSCAN_TX_URL(result.txSignature)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs font-semibold transition-colors"
          style={{ color: "#a78bfa" }}
          aria-label="View transaction on Solscan"
        >
          Solscan ↗
        </a>
      </div>

      {/* Viewing Key section */}
      <div className="px-6 py-5 flex flex-col gap-4">
        {/* Warning */}
        <div
          className="rounded-xl p-3.5 flex items-start gap-3"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
          role="alert"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-amber-300 text-xs leading-relaxed">
            <span className="font-bold">Save your viewing key.</span>{" "}
            This is the only key that decrypts this batch. It is stored locally in your browser
            and never sent anywhere. If you clear your browser data, you will need this export.
          </p>
        </div>

        {/* Key display */}
        <div>
          <p className="step-num uppercase tracking-widest mb-2">Viewing Key</p>
          <div
            className="relative rounded-xl p-4 font-mono text-xs break-all leading-relaxed"
            style={{
              background: "rgba(13,18,48,0.8)",
              border: "1px solid rgba(124,58,237,0.25)",
              color: "#94a3b8",
            }}
          >
            {revealed ? (
              result.viewingKey
            ) : (
              <span
                className="select-none"
                style={{ filter: "blur(6px)", userSelect: "none" }}
                aria-label="Viewing key hidden — click Reveal to show"
              >
                {result.viewingKey.slice(0, 120)}…
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setRevealed((r) => !r)}
            className="btn-secondary text-xs py-2 px-4"
          >
            {revealed ? "Hide" : "Reveal"}
          </button>
          <button
            onClick={copyKey}
            className="btn-secondary text-xs py-2 px-4"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button
            onClick={downloadKey}
            className="btn-primary text-xs py-2 px-4"
          >
            Download JSON ↓
          </button>
        </div>

        <p className="text-slate-600 text-xs">
          Paste this key on the{" "}
          <a
            href="/audit"
            className="underline underline-offset-2 transition-colors"
            style={{ color: "#a78bfa" }}
          >
            Audit page
          </a>{" "}
          to decrypt the full breakdown — no wallet required.
        </p>
      </div>
    </div>
  );
}
