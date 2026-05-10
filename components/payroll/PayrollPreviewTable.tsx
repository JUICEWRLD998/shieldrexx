"use client";

import { useCallback, useMemo } from "react";
import { DataGrid, type Column } from "@/components/ui/DataGrid";
import { WalletAddress } from "@/components/ui/WalletAddress";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import type { PayrollEntry, Token } from "@/types";
import { formatNumber } from "@/lib/utils";

const TOKENS: Token[] = ["USDC", "USDT", "SOL"];

interface Props {
  entries: PayrollEntry[];
  onChange: (entries: PayrollEntry[]) => void;
}

export function PayrollPreviewTable({ entries, onChange }: Props) {
  const updateEntry = useCallback((id: string, patch: Partial<PayrollEntry>) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, [entries, onChange]);

  const removeEntry = useCallback((id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  }, [entries, onChange]);

  const columns = useMemo<Column<PayrollEntry>[]>(() => [
    {
      key: "wallet",
      label: "Wallet",
      accessor: "wallet",
      render: (_value, entry) => (
        <WalletAddress address={entry.wallet} size="sm" />
      ),
    },
    {
      key: "token",
      label: "Token",
      accessor: "token",
      render: (_value, entry) => (
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
          aria-label={`Token for ${entry.wallet}`}
        >
          {TOKENS.map((t) => (
            <option key={t} value={t} style={{ background: "#0d1230", color: "#f1f5f9" }}>
              {t}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      accessor: "amount",
      align: "right",
      render: (_value, entry) => (
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
          aria-label={`Amount for ${entry.wallet}`}
        />
      ),
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      accessor: "status",
      align: "center",
      render: (_value, entry) => (
        <StatusIndicator status={entry.status} variant="pill" size="sm" />
      ),
    },
    {
      key: "actions",
      label: "",
      accessor: (entry) => entry.id,
      align: "right",
      render: (_value, entry) => (
        <button
          onClick={() => removeEntry(entry.id)}
          disabled={entry.status !== "pending"}
          className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Remove ${entry.wallet}`}
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
      ),
    },
  ], [removeEntry, updateEntry]);

  if (entries.length === 0) {
    return (
      <div className="card rounded-2xl p-10 text-center text-slate-500 text-sm">
        No valid entries. Upload a CSV to continue.
      </div>
    );
  }

  return (
    <div className="card rounded-2xl overflow-hidden">
      <DataGrid
        data={entries}
        columns={columns}
        emptyMessage="No valid entries. Upload a CSV to continue."
        hoverable
      />

      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(124,58,237,0.15)", background: "rgba(13,18,48,0.4)" }}
      >
        <p className="text-slate-500 text-xs">
          {entries.length} recipient{entries.length !== 1 ? "s" : ""} · total {formatNumber(entries.reduce((acc, e) => acc + e.amount, 0))}
        </p>
      </div>
    </div>
  );
}
