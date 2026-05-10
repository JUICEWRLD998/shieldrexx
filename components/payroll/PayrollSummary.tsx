"use client";

import { useMemo } from "react";
import type { PayrollEntry, Token } from "@/types";
import { getTokenColor } from "@/lib/design";
import { formatNumber } from "@/lib/utils";

interface Props {
  entries: PayrollEntry[];
}

export function PayrollSummary({ entries }: Props) {
  const totals = useMemo(
    () =>
      entries.reduce<Record<string, number>>((acc, e) => {
        acc[e.token] = (acc[e.token] ?? 0) + e.amount;
        return acc;
      }, {}),
    [entries]
  );

  const tokenBreakdown = useMemo(
    () => Object.entries(totals) as [Token, number][],
    [totals]
  );

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, sent: 0, failed: 0 };
    for (const e of entries) counts[e.status] += 1;
    return counts;
  }, [entries]);

  return (
    <div
      className="card rounded-2xl p-5 flex flex-col sm:flex-row gap-5 sm:items-center sm:justify-between"
    >
      {/* Recipients */}
      <div>
        <p className="step-num uppercase tracking-widest mb-0.5">Recipients</p>
        <p className="text-2xl font-bold text-white">{entries.length}</p>
      </div>

      {/* Divider */}
      <div
        className="hidden sm:block self-stretch w-px"
        style={{ background: "rgba(124,58,237,0.2)" }}
        aria-hidden="true"
      />
      <div className="sm:hidden h-px w-full" style={{ background: "rgba(124,58,237,0.2)" }} aria-hidden="true" />

      {/* Per-token totals */}
      <div className="flex flex-wrap gap-6">
        {tokenBreakdown.length === 0 ? (
          <p className="text-slate-500 text-sm">No entries yet.</p>
        ) : (
          tokenBreakdown.map(([token, total]) => (
            <div key={token}>
              <p className="step-num uppercase tracking-widest mb-0.5">{token}</p>
              <p
                className="text-2xl font-bold"
                style={{ color: getTokenColor(token) }}
              >
                {formatNumber(total, 6)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Status summary */}
      {(statusCounts.sent > 0 || statusCounts.failed > 0) && (
        <>
          <div className="hidden sm:block self-stretch w-px" style={{ background: "rgba(124,58,237,0.2)" }} aria-hidden="true" />
          <div className="flex gap-4 text-sm">
            {(["pending", "sent", "failed"] as const).map((s) => {
              const count = statusCounts[s];
              if (count === 0) return null;
              const color = s === "sent" ? "#4ade80" : s === "failed" ? "#f87171" : "#fbbf24";
              return (
                <div key={s}>
                  <p className="step-num uppercase tracking-widest mb-0.5">{s}</p>
                  <p className="text-xl font-bold" style={{ color }}>{count}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
