"use client";

import type { PerEntryStatus } from "@/lib/cloak";
import type { PayrollEntry } from "@/types";

const PHASE_LABEL: Record<PerEntryStatus["phase"], string> = {
  idle:        "Waiting",
  depositing:  "Depositing…",
  withdrawing: "Withdrawing…",
  done:        "Sent",
  failed:      "Failed",
};

const PHASE_COLOR: Record<PerEntryStatus["phase"], string> = {
  idle:        "#4b5563",
  depositing:  "#fbbf24",
  withdrawing: "#a78bfa",
  done:        "#4ade80",
  failed:      "#f87171",
};

function truncateWallet(w: string) {
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

interface Props {
  entries: PayrollEntry[];
  entryStatuses: PerEntryStatus[];
  isRunning: boolean;
  onSend: () => void;
  disabled?: boolean;
}

export function BatchSendButton({
  entries,
  entryStatuses,
  isRunning,
  onSend,
  disabled,
}: Props) {
  const statusMap = Object.fromEntries(entryStatuses.map((s) => [s.id, s]));
  const doneCount = entryStatuses.filter((s) => s.phase === "done").length;
  const total = entries.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress rows — only shown while running */}
      {isRunning && total > 0 && (
        <div className="card rounded-2xl overflow-hidden">
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(124,58,237,0.18)", background: "rgba(13,18,48,0.5)" }}
          >
            <p className="step-num uppercase tracking-widest">Sending privately via Cloak</p>
            <p className="text-slate-400 text-xs font-semibold">
              {doneCount}/{total} complete
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full" style={{ background: "rgba(124,58,237,0.15)" }}>
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${total > 0 ? (doneCount / total) * 100 : 0}%`,
                background: "linear-gradient(90deg,#6d28d9,#a78bfa)",
              }}
            />
          </div>

          <div className="divide-y" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
            {entries.map((entry) => {
              const es = statusMap[entry.id];
              const phase = es?.phase ?? "idle";
              const color = PHASE_COLOR[phase];
              const label = PHASE_LABEL[phase];

              return (
                <div
                  key={entry.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-4"
                  style={{ borderColor: "rgba(124,58,237,0.1)" }}
                >
                  <span className="font-mono text-xs text-slate-400">
                    {truncateWallet(entry.wallet)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {entry.amount} {entry.token}
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold ml-auto"
                    style={{ color }}
                  >
                    {(phase === "depositing" || phase === "withdrawing") && (
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="rgba(167,139,250,0.3)" strokeWidth="2" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={onSend}
        disabled={disabled || isRunning || entries.length === 0}
        className="btn-primary w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {isRunning ? (
          <>
            <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Sending {doneCount}/{total}…
          </>
        ) : (
          <>Send Privately via Cloak →</>
        )}
      </button>
    </div>
  );
}
