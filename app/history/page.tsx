"use client";

import { useCallback, useMemo, useState } from "react";
import { DataGrid, type Column } from "@/components/ui/DataGrid";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExecutiveInsights } from "@/components/history/ExecutiveInsights";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { WalletAddress } from "@/components/ui/WalletAddress";
import { useToast } from "@/components/providers/ToastProvider";
import { listStoredBatches, deleteViewingKey, type StoredBatch } from "@/lib/viewingKey";
import { formatDate, formatNumber, exportToCSV, exportToJSON, truncateTxSig } from "@/lib/utils";
import { SOLSCAN_TX_URL } from "@/lib/constants";
import type { Token } from "@/types";

const FILTER_TOKENS: Array<"ALL" | Token> = ["ALL", "USDC", "USDT", "SOL"];

function getBatchTokens(batch: StoredBatch): Token[] {
  const set = new Set<Token>();
  for (const e of batch.result.entries) set.add(e.token);
  return Array.from(set);
}

function getBatchTotal(batch: StoredBatch): number {
  return batch.result.entries.reduce((acc, e) => acc + e.amount, 0);
}

export default function HistoryPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [tokenFilter, setTokenFilter] = useState<"ALL" | Token>("ALL");
  const [rows, setRows] = useState<StoredBatch[]>(() =>
    typeof window === "undefined" ? [] : listStoredBatches()
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((batch) => {
      const tokens = getBatchTokens(batch);
      const tokenPass = tokenFilter === "ALL" || tokens.includes(tokenFilter);
      if (!tokenPass) return false;
      if (!q) return true;

      const inBatchId = batch.batchId.toLowerCase().includes(q);
      const inTx = batch.result.txSignature.toLowerCase().includes(q);
      const inWallet = batch.result.entries.some((e) => e.wallet.toLowerCase().includes(q));
      return inBatchId || inTx || inWallet;
    });
  }, [query, rows, tokenFilter]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, b) => {
        acc.count += 1;
        acc.recipients += b.result.entries.length;
        acc.amount += getBatchTotal(b);
        return acc;
      },
      { count: 0, recipients: 0, amount: 0 }
    );
  }, [filtered]);

  const handleRefresh = useCallback(() => {
    setRows(listStoredBatches());
    toast({ type: "info", title: "History refreshed" });
  }, [toast]);

  const handleDelete = useCallback((batchId: string) => {
    deleteViewingKey(batchId);
    setRows((prev) => prev.filter((b) => b.batchId !== batchId));
    toast({ type: "success", title: "Batch deleted from local vault" });
  }, [toast]);

  const handleExportAllCsv = useCallback(() => {
    exportToCSV(
      filtered.map((b) => ({
        batchId: b.batchId,
        txSignature: b.result.txSignature,
        timestamp: b.result.timestamp,
        recipients: b.result.entries.length,
        totalAmount: getBatchTotal(b),
        tokens: getBatchTokens(b).join("/"),
      })),
      "shieldrexx-batch-history"
    );
    toast({ type: "success", title: "History exported", message: "CSV downloaded" });
  }, [filtered, toast]);

  const handleExportViewingKey = useCallback((batch: StoredBatch) => {
    exportToJSON(batch.result.viewingKey, `shieldrexx-viewing-key-${batch.batchId}`);
    toast({ type: "success", title: "Viewing key exported" });
  }, [toast]);

  const tableRows = useMemo(
    () =>
      filtered.map((batch) => ({
        id: batch.batchId,
        batch,
      })),
    [filtered]
  );

  const columns = useMemo<Column<{ id: string; batch: StoredBatch }>[]>(
    () => [
      {
        key: "batch",
        label: "Batch ID",
        accessor: (row) => row.batch.batchId,
        render: (value) => <WalletAddress address={String(value)} startChars={7} endChars={6} size="sm" />, 
      },
      {
        key: "tx",
        label: "Tx Signature",
        accessor: (row) => row.batch.result.txSignature,
        render: (value) => {
          const sig = String(value);
          return (
            <a
              href={SOLSCAN_TX_URL(sig)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono"
              style={{ color: "#a78bfa" }}
            >
              {truncateTxSig(sig)} ↗
            </a>
          );
        },
      },
      {
        key: "tokens",
        label: "Tokens",
        accessor: (row) => getBatchTokens(row.batch).join("/"),
        render: (value) => <span className="text-xs text-slate-300 font-semibold">{String(value)}</span>,
      },
      {
        key: "recipients",
        label: "Recipients",
        accessor: (row) => row.batch.result.entries.length,
        align: "right",
        sortable: true,
        render: (value) => <span className="text-sm font-semibold">{String(value)}</span>,
      },
      {
        key: "total",
        label: "Total",
        accessor: (row) => getBatchTotal(row.batch),
        align: "right",
        sortable: true,
        render: (value) => <span className="text-sm font-semibold">{formatNumber(Number(value), 6)}</span>,
      },
      {
        key: "date",
        label: "Created",
        accessor: (row) => row.batch.result.timestamp,
        sortable: true,
        render: (value) => <span className="text-xs text-slate-400">{formatDate(Number(value))}</span>,
      },
      {
        key: "status",
        label: "Status",
        accessor: () => "done",
        render: () => <StatusIndicator status="done" variant="pill" size="sm" />,
      },
      {
        key: "actions",
        label: "Actions",
        accessor: (row) => row.batch.batchId,
        render: (_value, row) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleExportViewingKey(row.batch)}
              className="btn-secondary px-2.5 py-1 text-xs"
            >
              Export Key
            </button>
            <button
              onClick={() => handleDelete(row.batch.batchId)}
              className="px-2.5 py-1 text-xs rounded-lg"
              style={{ color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}
            >
              Delete
            </button>
          </div>
        ),
        align: "right",
      },
    ],
    [handleDelete, handleExportViewingKey]
  );

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-10 flex flex-col gap-5">
      <div>
        <p className="step-num uppercase tracking-widest mb-1">Batch History</p>
        <h1 className="text-3xl font-bold text-white">Private Payroll Runs</h1>
        <p className="text-slate-400 mt-2">
          Track every local batch, search by wallet or tx, and export viewing keys for audits.
        </p>
      </div>

      <InfoBanner
        role="note"
        type="info"
        title="Local vault"
        description="History is stored only in this browser localStorage. Deleting a row removes its viewing key from this device only."
      />

      <ExecutiveInsights batches={rows} />

      <div className="card rounded-2xl p-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-500">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Batch ID, tx signature, wallet"
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "rgba(13,18,48,0.75)", border: "1px solid rgba(124,58,237,0.25)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-500">Token</span>
            <select
              value={tokenFilter}
              onChange={(e) => setTokenFilter(e.target.value as "ALL" | Token)}
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "rgba(13,18,48,0.75)", border: "1px solid rgba(124,58,237,0.25)" }}
            >
              {FILTER_TOKENS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-3 gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(13,18,48,0.55)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <div>
              <p className="text-[11px] text-slate-500">Batches</p>
              <p className="text-sm font-semibold">{totals.count}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Recipients</p>
              <p className="text-sm font-semibold">{totals.recipients}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Total</p>
              <p className="text-sm font-semibold">{formatNumber(totals.amount, 2)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:justify-end">
          <button onClick={handleRefresh} className="btn-secondary px-3 py-2 text-xs">Refresh</button>
          <button
            onClick={handleExportAllCsv}
            disabled={filtered.length === 0}
            className="btn-secondary px-3 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export Filtered CSV
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No saved batches yet"
          description="Run your first private payroll from the dashboard. Successful runs are automatically stored here."
        />
      ) : (
        <DataGrid data={tableRows} columns={columns} emptyMessage="No batches match your filters." />
      )}
    </div>
  );
}
