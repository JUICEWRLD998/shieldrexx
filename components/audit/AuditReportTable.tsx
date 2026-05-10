"use client";

import type { AuditRecord } from "@/types";
import { SOLSCAN_TX_URL } from "@/lib/constants";
import { getTokenColor } from "@/lib/design";
import { formatDate, formatNumber, truncateTxSig, exportToCSV } from "@/lib/utils";
import { WalletAddress } from "@/components/ui/WalletAddress";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { DataGrid, type Column } from "@/components/ui/DataGrid";
import { useMemo } from "react";

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

  const columns = useMemo<Column<AuditRecord>[]>(() => [
    {
      key: "wallet",
      label: "Wallet",
      accessor: "wallet",
      render: (_value, row) => <WalletAddress address={row.wallet} startChars={8} endChars={6} size="sm" />,
    },
    {
      key: "token",
      label: "Token",
      accessor: "token",
      render: (_value, row) => (
        <span className="inline-flex items-center gap-2">
          <TokenIcon token={row.token} size="sm" />
          <span className="text-xs font-semibold" style={{ color: getTokenColor(row.token) }}>
            {row.token}
          </span>
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      accessor: "amount",
      align: "right",
      sortable: true,
      render: (value) => (
        <span className="text-slate-200 text-sm font-semibold tabular-nums">
          {formatNumber(Number(value), 6)}
        </span>
      ),
    },
    {
      key: "tx",
      label: "Tx Signature",
      accessor: "txSignature",
      render: (value) => {
        const sig = String(value ?? "");
        if (!sig) return <span className="text-slate-600 text-xs">—</span>;
        return (
          <a
            href={SOLSCAN_TX_URL(sig)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs transition-colors truncate"
            style={{ color: "#a78bfa" }}
            title={sig}
            aria-label={`View transaction ${sig} on Solscan`}
          >
            {truncateTxSig(sig)} ↗
          </a>
        );
      },
    },
  ], []);

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
              style={{ color: getTokenColor(token) }}
            >
              {formatNumber(total, 6)} {token}
            </span>
            <span className="text-slate-600 text-xs">total</span>
          </div>
        ))}

        <span className="text-slate-600 text-xs ml-auto">
          Decrypted {formatDate(timestamp)}
        </span>
      </div>

      {/* Table */}
      <div
        className="card rounded-2xl overflow-hidden"
        role="region"
        aria-label="Decrypted batch recipients"
      >
        <DataGrid
          data={records.map((r, i) => ({ ...r, id: `${r.wallet}-${r.txSignature}-${i}` }))}
          columns={columns as Column<(AuditRecord & { id: string })>[]}
          emptyMessage="No decrypted recipients found."
          hoverable
        />
      </div>

      {/* Export row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <p className="text-slate-600 text-xs">
          This report is decrypted locally — no data left your browser.
        </p>
        <div className="flex items-center gap-2">
          {batchTxSignature && (
            <a
              href={SOLSCAN_TX_URL(batchTxSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs py-2 px-4 shrink-0"
            >
              View Batch Tx ↗
            </a>
          )}
          <button
            onClick={() => exportToCSV(records, "shieldrexx-audit")}
            className="btn-secondary text-xs py-2 px-4 shrink-0"
          >
            Export CSV ↓
          </button>
        </div>
      </div>
    </div>
  );
}
