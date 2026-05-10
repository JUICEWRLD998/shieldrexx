"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletGuard } from "@/components/ui/WalletGuard";
import { CSVUploader } from "@/components/payroll/CSVUploader";
import { PayrollPreviewTable } from "@/components/payroll/PayrollPreviewTable";
import { PayrollSummary } from "@/components/payroll/PayrollSummary";
import { BatchSendButton } from "@/components/payroll/BatchSendButton";
import { ViewingKeyCard } from "@/components/payroll/ViewingKeyCard";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { useCloakBatch } from "@/hooks/useCloakBatch";
import { useLiveTransactionStatus } from "@/hooks/useLiveTransactionStatus";
import { usePhantom } from "@/components/providers/PhantomProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { SOLSCAN_TX_URL } from "@/lib/constants";
import { formatDate, formatNumber, truncateTxSig } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";
import type { PayrollEntry } from "@/types";

const STEPS = ["Upload CSV", "Review & Send", "Confirmation"] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 mb-8 overflow-x-auto pb-1" aria-label="Progress steps" role="list">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step} className="flex items-center gap-1.5 sm:gap-2 shrink-0" role="listitem">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={
                active
                  ? { background: "linear-gradient(135deg,#6d28d9,#7c3aed)", color: "#fff" }
                  : done
                  ? { background: "rgba(109,40,217,0.4)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.5)" }
                  : { background: "rgba(109,40,217,0.1)", color: "#4b5563", border: "1px solid rgba(124,58,237,0.2)" }
              }
              aria-current={active ? "step" : undefined}
            >
              {done ? "✓" : i + 1}
            </div>
            <span
              className="text-xs sm:text-sm font-medium whitespace-nowrap"
              style={{ color: active ? "#f1f5f9" : done ? "#a78bfa" : "#4b5563" }}
            >
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className="w-4 sm:w-6 h-px mx-0.5 sm:mx-1 shrink-0"
                style={{ background: done ? "rgba(124,58,237,0.5)" : "rgba(124,58,237,0.18)" }}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { publicKey, connection, signTransaction, signMessage } = usePhantom();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const { toast } = useToast();

  // Build a wallet adapter shape from Phantom context
  const wallet = useMemo(
    () =>
      publicKey && signTransaction && signMessage
        ? { publicKey, signTransaction, signMessage }
        : null,
    [publicKey, signMessage, signTransaction]
  );

  const { status, entryStatuses, batchResult, error, run, reset } =
    useCloakBatch(wallet, connection);

  const trackedSignature = useMemo(() => {
    if (batchResult?.txSignature) return batchResult.txSignature;
    const latest = [...entryStatuses].reverse().find((s) => Boolean(s.txSignature));
    return latest?.txSignature ?? null;
  }, [batchResult, entryStatuses]);

  const {
    txStatus,
    isLoading: txLoading,
    error: txError,
    lastUpdated,
    refetch: refetchTxStatus,
  } = useLiveTransactionStatus({
    connection,
    signature: trackedSignature,
    enabled: Boolean(trackedSignature),
    pollIntervalMs: 5_000,
  });

  // Toast on batch status changes
  useEffect(() => {
    if (status === "success" && batchResult) {
      toast({
        type: "success",
        title: "Batch sent privately",
        message: `${batchResult.entries.length} recipient${batchResult.entries.length !== 1 ? "s" : ""} disbursed · viewing key saved`,
        duration: 5000,
      });
    } else if (status === "failed" && error) {
      toast({
        type: "error",
        title: "Batch send failed",
        message: error.length > 80 ? error.slice(0, 77) + "…" : error,
        duration: 6000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleParsed = useCallback((parsed: PayrollEntry[]) => {
    setEntries(parsed);
    setStep(1);
  }, []);

  const handleReset = useCallback(() => {
    setEntries([]);
    setStep(0);
    reset();
  }, [reset]);

  const handleSend = useCallback(async () => {
    await run(entries);
    setStep(2);
  }, [entries, run]);

  const txBannerType = useMemo<"info" | "success" | "error">(() => {
    if (!txStatus) return "info";
    if (txStatus.status === "failed") return "error";
    if (txStatus.status === "finalized") return "success";
    return "info";
  }, [txStatus]);

  const txBannerTitle = useMemo(() => {
    if (!txStatus) return "Tracking transaction";
    if (txStatus.status === "failed") return "Transaction failed";
    if (txStatus.status === "finalized") return "Transaction finalized";
    if (txStatus.status === "confirmed") return "Transaction confirmed";
    return "Transaction pending";
  }, [txStatus]);

  const txBannerDescription = useMemo(() => {
    if (!trackedSignature) return "Waiting for transaction signature...";

    const lines: string[] = [
      `Signature: ${truncateTxSig(trackedSignature)}`,
      txStatus
        ? `Confirmations: ${txStatus.confirmations} · Slot: ${txStatus.slot} · Fee: ${formatNumber(txStatus.fee / 1_000_000_000, 9)} SOL`
        : "Fetching latest status from cluster...",
    ];

    if (txStatus) {
      lines.push(`Status time: ${formatDate(txStatus.timestamp)}`);
    }
    if (lastUpdated) {
      lines.push(`Last checked: ${formatDate(lastUpdated)}`);
    }
    if (txError) {
      lines.push(`Tracker error: ${txError}`);
    }

    return lines.join("\n");
  }, [lastUpdated, trackedSignature, txError, txStatus]);

  return (
    <WalletGuard>
      <div className="max-w-4xl mx-auto w-full px-4 py-10">
        {/* Page header */}
        <div className="mb-8">
          <p className="step-num uppercase tracking-widest mb-1">Treasurer Dashboard</p>
          <h1 className="text-3xl font-bold text-white">Payroll Disbursement</h1>
          <p className="text-slate-400 mt-2">
            Upload a CSV and run a private batch disbursement via Cloak.
          </p>
        </div>

        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
        {/* ── Step 0: Upload ── */}
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
          >
            <CSVUploader onParsed={handleParsed} />
          </motion.div>
        )}

        {/* ── Step 1: Review & Send ── */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="flex flex-col gap-5"
          >
            <PayrollSummary entries={entries} />
            <PayrollPreviewTable
              entries={entries}
              onChange={setEntries}
            />

            {/* Error banner */}
            {error && (
              <InfoBanner type="error" title="Batch failed" description={error} role="alert" />
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-1">
              <button
                onClick={handleReset}
                disabled={status === "running"}
                className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Upload different CSV
              </button>

              <BatchSendButton
                entries={entries}
                entryStatuses={entryStatuses}
                isRunning={status === "running"}
                onSend={handleSend}
                disabled={entries.length === 0}
              />
            </div>

            {trackedSignature && (
              <InfoBanner
                type={txBannerType}
                role="status"
                title={txBannerTitle}
                description={
                  <div className="space-y-1">
                    <p className="whitespace-pre-line">{txBannerDescription}</p>
                    <div className="flex items-center gap-2 pt-1">
                      {txLoading && <Spinner size="sm" />}
                      <button onClick={() => void refetchTxStatus()} className="btn-secondary px-2.5 py-1 text-xs">
                        Refresh status
                      </button>
                      <a
                        href={SOLSCAN_TX_URL(trackedSignature)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary px-2.5 py-1 text-xs"
                      >
                        Open Solscan ↗
                      </a>
                    </div>
                  </div>
                }
              />
            )}
          </motion.div>
        )}

        {/* ── Step 2: Confirmation / Viewing Key ── */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="flex flex-col gap-5"
          >
            {batchResult && <ViewingKeyCard result={batchResult} />}

            {/* If batch failed mid-way, still show what we have */}
            {status === "failed" && !batchResult && (
              <InfoBanner
                type="error"
                title="Batch failed"
                description={error ?? "Unknown error"}
                role="alert"
              />
            )}

            <button onClick={handleReset} className="btn-secondary text-sm w-fit">
              ← Start a new batch
            </button>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </WalletGuard>
  );
}
