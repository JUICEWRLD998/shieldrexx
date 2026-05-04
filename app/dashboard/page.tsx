"use client";

import { useState } from "react";
import { WalletGuard } from "@/components/ui/WalletGuard";
import { CSVUploader } from "@/components/payroll/CSVUploader";
import { PayrollPreviewTable } from "@/components/payroll/PayrollPreviewTable";
import { PayrollSummary } from "@/components/payroll/PayrollSummary";
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
  const [step, setStep] = useState<0 | 1>(0);
  const [entries, setEntries] = useState<PayrollEntry[]>([]);

  function handleParsed(parsed: PayrollEntry[]) {
    setEntries(parsed);
    setStep(1);
  }

  function handleReset() {
    setEntries([]);
    setStep(0);
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
            <PayrollPreviewTable entries={entries} onChange={setEntries} />

            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-1">
              <button onClick={handleReset} className="btn-secondary text-sm">
                ← Upload different CSV
              </button>
              <button
                disabled={entries.length === 0}
                className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                onClick={() => {
                  // Phase 3 will replace this with useCloakBatch()
                  alert("Phase 3: Cloak batch send will fire here.");
                }}
              >
                Send Privately via Cloak →
              </button>
            </div>

            <p className="text-center text-slate-600 text-xs">
              Private batch disbursement via Cloak SDK — coming in Phase 3
            </p>
          </div>
        )}
      </div>
    </WalletGuard>
  );
}
