"use client";

import type { PayrollEntry, Token } from "@/types";

interface Props {
  entries: PayrollEntry[];
}

const TOKEN_COLOR: Record<Token, string> = {
  USDC: "#4ade80",
  USDT: "#34d399",
  SOL:  "#a78bfa",
};

export function PayrollSummary({ entries }: Props) {
  const totals = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.token] = (acc[e.token] ?? 0) + e.amount;
    return acc;
  }, {});

  const tokenBreakdown = Object.entries(totals) as [Token, number][];

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
                style={{ color: TOKEN_COLOR[token] ?? "#f1f5f9" }}
              >
                {total.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Status summary */}
      {entries.some((e) => e.status !== "pending") && (
        <>
          <div className="hidden sm:block self-stretch w-px" style={{ background: "rgba(124,58,237,0.2)" }} aria-hidden="true" />
          <div className="flex gap-4 text-sm">
            {(["pending", "sent", "failed"] as const).map((s) => {
              const count = entries.filter((e) => e.status === s).length;
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
