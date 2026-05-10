"use client";

import { useMemo } from "react";
import type { PerEntryStatus } from "@/lib/cloak";
import type { PayrollEntry } from "@/types";
import { PHASE_CONFIG } from "@/lib/design";
import { truncateWallet } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";
import { StatusIndicator } from "@/components/ui/StatusIndicator";

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
  const statusMap = useMemo(
    () => Object.fromEntries(entryStatuses.map((s) => [s.id, s])),
    [entryStatuses]
  );
  const doneCount = useMemo(
    () => entryStatuses.filter((s) => s.phase === "done").length,
    [entryStatuses]
  );
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
              const config = PHASE_CONFIG[phase];

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
                  <div className="inline-flex items-center gap-1.5 ml-auto">
                    {(phase === "depositing" || phase === "withdrawing") && (
                      <Spinner size="sm" />
                    )}
                    <StatusIndicator
                      status={phase}
                      showLabel
                      size="sm"
                      variant="text"
                      color={config.color}
                    />
                  </div>
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
            <Spinner size="sm" color="#ffffff" bgColor="rgba(255,255,255,0.3)" />
            Sending {doneCount}/{total}…
          </>
        ) : (
          <>Send Privately via Cloak →</>
        )}
      </button>
    </div>
  );
}
