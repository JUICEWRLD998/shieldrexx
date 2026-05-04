"use client";

import type { AuditRecord } from "@/types";
import { SOLSCAN_TX_URL } from "@/lib/constants";

const TOKEN_COLOR: Record<string, string> = {
  USDC: "#4ade80",
  USDT: "#34d399",
  SOL: "#a78bfa",
};

function truncateWallet(w: string) {
  return `${w.slice(0, 8)}…${w.slice(-6)}`;
}

function truncateSig(sig: string) {
  if (!sig) return "—";
  return `${sig.slice(0, 8)}…${sig.slice(-6)}`;
}

function exportCSV(records: AuditRecord[]) {
  const header = "wallet,amount,token,txSignature";
  const rows = records.map((r) => {
    // Wrap wallet in quotes to handle any comma-edge case
    return `"${r.wallet}",${r.amount},${r.token},"${r.txSignature}"`;
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shieldrexx-audit-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface Props {
  records: AuditRecord[];
  batchTxSignature: string;
  timestamp: number;
}

export function AuditReportTable({ records, batchTxSignature, timestamp }: Props) {
  // Aggregate totals per token
  const totals = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.token] = (acc[r.token] ?? 0) + r.amount;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {/* Summary strip */}
      <div
        className="rounded-xl px-5 py-3.5 flex flex-wrap gap-x-6 gap-y-2 items-center"
        style={{
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.2)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#4ade80" }}
            aria-hidden="true"
          />
          <span className="text-slate-300 text-xs font-semibold">
            {records.length} recipient{records.length !== 1 ? "s" : ""}
          </span>
        </div>

        {Object.entries(totals).map(([token, total]) => (
          <div key={token} className="flex items-center gap-1.5">
            <span
              className="text-xs font-bold"
              style={{ color: TOKEN_COLOR[token] ?? "#94a3b8" }}
            >
              {total.toLocaleString(undefined, { maximumFractionDigits: 6 })} {token}
            </span>
            <span className="text-slate-600 text-xs">total</span>
          </div>
        ))}

        <span className="text-slate-600 text-xs ml-auto">
          Decrypted {new Date(timestamp).toLocaleString()}
        </span>
      </div>

      {/* Table */}
      <div
        className="card rounded-2xl overflow-hidden"
        role="region"
        aria-label="Decrypted batch recipients"
      >
        <div className="overflow-x-auto">
        {/* Table header */}
        <div
          className="grid text-left px-4 py-3"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr 2fr",
            minWidth: "480px",
            background: "rgba(13,18,48,0.6)",
            borderBottom: "1px solid rgba(124,58,237,0.15)",
          }}
        >
          {["Wallet", "Token", "Amount", "Tx Signature"].map((h) => (
            <span key={h} className="step-num uppercase tracking-widest">
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
          {records.map((r, i) => (
            <div
              key={i}
              className="grid px-4 py-3.5 items-center hover:bg-white/2 transition-colors"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 2fr",
                minWidth: "480px",
                borderColor: "rgba(124,58,237,0.08)",
              }}
            >
              {/* Wallet */}
              <span
                className="font-mono text-xs text-slate-300 select-all"
                title={r.wallet}
              >
                {truncateWallet(r.wallet)}
              </span>

              {/* Token */}
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: TOKEN_COLOR[r.token] ?? "#94a3b8" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: TOKEN_COLOR[r.token] ?? "#94a3b8" }}
                  aria-hidden="true"
                />
                {r.token}
              </span>

              {/* Amount */}
              <span className="text-slate-200 text-sm font-semibold tabular-nums">
                {r.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </span>

              {/* Tx Signature */}
              {r.txSignature ? (
                <a
                  href={SOLSCAN_TX_URL(r.txSignature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs transition-colors truncate"
                  style={{ color: "#a78bfa" }}
                  title={r.txSignature}
                  aria-label={`View transaction ${r.txSignature} on Solscan`}
                >
                  {truncateSig(r.txSignature)} ↗
                </a>
              ) : (
                <span className="text-slate-600 text-xs">—</span>
              )}
            </div>
          ))}
        </div>
        </div>{/* end overflow-x-auto */}
      </div>

      {/* Export row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <p className="text-slate-600 text-xs">
          This report is decrypted locally — no data left your browser.
        </p>
        <button
          onClick={() => exportCSV(records)}
          className="btn-secondary text-xs py-2 px-4 shrink-0"
        >
          Export CSV ↓
        </button>
      </div>
    </div>
  );
}
