"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewingKey } from "@/hooks/useViewingKey";
import { ViewingKeyImport } from "@/components/audit/ViewingKeyImport";
import { AuditReportTable } from "@/components/audit/AuditReportTable";
import { useToast } from "@/components/providers/ToastProvider";
import { InfoBanner } from "@/components/ui/InfoBanner";

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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="mb-6"
      >
        <InfoBanner
          role="note"
          type="info"
          size="md"
          title="No wallet needed"
          description="The viewing key contains everything needed to decrypt this batch. Share the key — not your wallet — with your accountant or compliance officer."
        />
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
            <InfoBanner
              type="success"
              role="status"
              title={`Batch decrypted — ${batch.recipientCount} recipient${batch.recipientCount !== 1 ? "s" : ""}`}
              action={{ label: "Import another →", onClick: reset }}
            />

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
