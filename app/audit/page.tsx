"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewingKey } from "@/hooks/useViewingKey";
import { ViewingKeyImport } from "@/components/audit/ViewingKeyImport";
import { AuditReportTable } from "@/components/audit/AuditReportTable";
import { useToast } from "@/components/providers/ToastProvider";

export default function AuditPage() {
  const { batch, status, error, importKey, reset } = useViewingKey();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "success" && batch) {
      toast({
        type: "success",
        title: "Batch decrypted",
        message: `${batch.recipientCount} recipient${batch.recipientCount !== 1 ? "s" : ""} unlocked`,
      });
    } else if (status === "error" && error) {
      toast({ type: "error", title: "Invalid viewing key", message: error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-10">
      {/* Page header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="step-num uppercase tracking-widest mb-1">Audit Report</p>
        <h1 className="text-3xl font-bold text-white">Verify a Batch</h1>
        <p className="text-slate-400 mt-2">
          Paste a viewing key to decrypt the full payroll breakdown. No wallet
          required — designed for accountants and auditors.
        </p>
      </motion.div>

      {/* Info notice */}
      <motion.div
        className="card rounded-xl p-4 mb-6 flex items-start gap-3"
        style={{ borderColor: "rgba(124,58,237,0.3)" }}
        role="note"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "rgba(109,40,217,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="1.5" />
            <path d="M12 8v4m0 4h.01" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-slate-200 text-sm font-medium mb-0.5">No wallet needed</p>
          <p className="text-slate-500 text-xs leading-relaxed">
            The viewing key contains everything needed to decrypt this batch.
            Share the key — not your wallet — with your accountant or compliance officer.
          </p>
        </div>
      </motion.div>

      {/* ── Animated state transitions ── */}
      <AnimatePresence mode="wait">
        {/* Import form */}
        {status !== "success" && (
          <motion.div
            key="import"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="card rounded-2xl p-6"
          >
            <ViewingKeyImport
              onImport={importKey}
              isError={status === "error"}
              errorMessage={error}
            />
          </motion.div>
        )}

        {/* Decrypted report */}
        {status === "success" && batch && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="flex flex-col gap-5"
          >
            {/* Success banner */}
            <div
              className="rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
              style={{
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-slate-200 text-sm font-semibold">
                  Batch decrypted — {batch.recipientCount} recipient{batch.recipientCount !== 1 ? "s" : ""}
                </span>
              </div>
              <button
                onClick={reset}
                className="text-slate-500 hover:text-slate-300 text-xs font-semibold transition-colors shrink-0 self-start sm:self-auto"
              >
                Import another →
              </button>
            </div>

            <AuditReportTable
              records={batch.records}
              batchTxSignature={batch.txSignature}
              timestamp={batch.timestamp}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
