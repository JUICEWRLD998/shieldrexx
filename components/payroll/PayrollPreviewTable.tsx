"use client";

import type { PayrollEntry, Token } from "@/types";

const TOKENS: Token[] = ["USDC", "USDT", "SOL"];

const STATUS_STYLES: Record<PayrollEntry["status"], { bg: string; color: string; label: string }> = {
  pending: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", label: "Pending" },
  sent:    { bg: "rgba(34,197,94,0.12)",  color: "#4ade80", label: "Sent"    },
  failed:  { bg: "rgba(239,68,68,0.12)",  color: "#f87171", label: "Failed"  },
};

interface Props {
  entries: PayrollEntry[];
  onChange: (entries: PayrollEntry[]) => void;
}

function truncateWallet(wallet: string) {
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
}

export function PayrollPreviewTable({ entries, onChange }: Props) {
  function updateEntry(id: string, patch: Partial<PayrollEntry>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(id: string) {
    onChange(entries.filter((e) => e.id !== id));
  }

  if (entries.length === 0) {
    return (
      <div className="card rounded-2xl p-10 text-center text-slate-500 text-sm">
        No valid entries. Upload a CSV to continue.
      </div>
    );
  }

  return (
    <div className="card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Payroll preview">
          <thead>
            <tr
              style={{ borderBottom: "1px solid rgba(124,58,237,0.18)", background: "rgba(13,18,48,0.5)" }}
            >
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                Wallet
              </th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                Token
              </th>
              <th className="text-right px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                Amount
              </th>
              <th className="text-center px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const status = STATUS_STYLES[entry.status];
              return (
                <tr
                  key={entry.id}
                  style={{
                    borderTop: i === 0 ? undefined : "1px solid rgba(124,58,237,0.1)",
                  }}
                  className="transition-colors hover:bg-white/2"
                >
                  {/* Wallet */}
                  <td className="px-5 py-3.5">
                    <span
                      className="font-mono text-xs text-slate-300 bg-white/5 rounded px-2 py-1"
                      title={entry.wallet}
                    >
                      {truncateWallet(entry.wallet)}
                    </span>
                  </td>

                  {/* Token */}
                  <td className="px-5 py-3.5">
                    <select
                      value={entry.token}
                      onChange={(e) => updateEntry(entry.id, { token: e.target.value as Token })}
                      disabled={entry.status !== "pending"}
                      className="text-sm font-semibold rounded-lg px-2 py-1 outline-none cursor-pointer disabled:opacity-50"
                      style={{
                        background: "rgba(109,40,217,0.15)",
                        border: "1px solid rgba(124,58,237,0.3)",
                        color: "#c4b5fd",
                      }}
                      aria-label={`Token for ${truncateWallet(entry.wallet)}`}
                    >
                      {TOKENS.map((t) => (
                        <option key={t} value={t} style={{ background: "#0d1230", color: "#f1f5f9" }}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-3.5 text-right">
                    <input
                      type="number"
                      min="0.000001"
                      step="any"
                      value={entry.amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) updateEntry(entry.id, { amount: val });
                      }}
                      disabled={entry.status !== "pending"}
                      className="bg-transparent text-white font-semibold text-sm text-right w-24 outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label={`Amount for ${truncateWallet(entry.wallet)}`}
                    />
                  </td>

                  {/* Status badge */}
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </td>

                  {/* Delete */}
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => removeEntry(entry.id)}
                      disabled={entry.status !== "pending"}
                      className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={`Remove ${truncateWallet(entry.wallet)}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-hidden="true">
                        <path
                          d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(124,58,237,0.15)", background: "rgba(13,18,48,0.4)" }}
      >
        <p className="text-slate-500 text-xs">
          {entries.length} recipient{entries.length !== 1 ? "s" : ""} · click amount or label to edit
        </p>
      </div>
    </div>
  );
}
