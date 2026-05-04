"use client";

import { useState } from "react";
import { WalletGuard } from "@/components/ui/WalletGuard";
import { CSVUploader } from "@/components/payroll/CSVUploader";
import { PayrollPreviewTable } from "@/components/payroll/PayrollPreviewTable";
import { PayrollSummary } from "@/components/payroll/PayrollSummary";
import { BatchSendButton } from "@/components/payroll/BatchSendButton";
import { ViewingKeyCard } from "@/components/payroll/ViewingKeyCard";
import { useCloakBatch } from "@/hooks/useCloakBatch";
import { usePhantom } from "@/components/providers/PhantomProvider";
import type { PayrollEntry } from "@/types";

const STEPS = ["Upload CSV", "Review & Send", "Confirmation"] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8" aria-label="Progress steps" role="list">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step} className="flex items-center gap-2" role="listitem">
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
              className="text-sm font-medium"
              style={{ color: active ? "#f1f5f9" : done ? "#a78bfa" : "#4b5563" }}
            >
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className="w-6 h-px mx-1"
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
  const { publicKey, connection, signTransaction } = usePhantom();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [entries, setEntries] = useState<PayrollEntry[]>([]);

  // Build a wallet adapter shape from Phantom context
  const wallet =
    publicKey && signTransaction
      ? { publicKey, signTransaction }
      : null;

  const { status, entryStatuses, batchResult, error, run, reset } =
    useCloakBatch(wallet, connection);

  function handleParsed(parsed: PayrollEntry[]) {
    setEntries(parsed);
    setStep(1);
  }

  function handleReset() {
    setEntries([]);
    setStep(0);
    reset();
  }

  async function handleSend() {
    await run(entries);
    setStep(2);
  }

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

        {/* ── Step 0: Upload ── */}
        {step === 0 && (
          <CSVUploader onParsed={handleParsed} />
        )}

        {/* ── Step 1: Review & Send ── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <PayrollSummary entries={entries} />
            <PayrollPreviewTable
              entries={entries}
              onChange={setEntries}
            />

            {/* Error banner */}
            {error && (
              <div
                className="rounded-xl p-4 text-sm"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                role="alert"
              >
                <span className="font-semibold">Batch failed: </span>{error}
              </div>
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
          </div>
        )}

        {/* ── Step 2: Confirmation / Viewing Key ── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            {batchResult && <ViewingKeyCard result={batchResult} />}

            {/* If batch failed mid-way, still show what we have */}
            {status === "failed" && !batchResult && (
              <div
                className="card rounded-2xl p-8 text-center flex flex-col gap-4"
                role="alert"
              >
                <p className="text-red-400 font-semibold">Batch failed</p>
                <p className="text-slate-400 text-sm">{error}</p>
              </div>
            )}

            <button onClick={handleReset} className="btn-secondary text-sm w-fit">
              ← Start a new batch
            </button>
          </div>
        )}
      </div>
    </WalletGuard>
  );
}
