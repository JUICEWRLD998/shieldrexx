"use client";

import { motion } from "framer-motion";
import { usePhantom } from "@/components/providers/PhantomProvider";
import { WalletGuard } from "@/components/ui/WalletGuard";
import { useContributorPayments } from "@/hooks/useContributorPayments";
import { ContributorPaymentList } from "@/components/contributor/ContributorPayment";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { Spinner } from "@/components/ui/Spinner";

function ContributorContent() {
  const { publicKey, signMessage } = usePhantom();
  const { payments, status, error, refetch } = useContributorPayments(
    publicKey,
    signMessage
  );

  const isScanning = status === "signing" || status === "scanning";

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-10">
      {/* Page header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="step-num uppercase tracking-widest mb-1">Contributor View</p>
        <h1 className="text-3xl font-bold text-white">My Payments</h1>
        <p className="text-slate-400 mt-2">
          Only private payments addressed to your connected wallet are shown
          here — nothing else is ever exposed.
        </p>
      </motion.div>

      {/* Privacy notice */}
      <div className="mb-5">
        <InfoBanner
          role="note"
          type="info"
          title="Privacy guaranteed"
          description="Other batch recipients and their amounts are never surfaced here. Only your own incoming transfers are decrypted and displayed."
        />
      </div>

      {/* Error banner (hard errors only — network/relay empty = empty state) */}
      {status === "error" && error && (
        <InfoBanner type="error" title="Scan failed" description={error} className="mb-5" role="alert" />
      )}

      {/* Status bar */}
      {(isScanning || status === "done") && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isScanning ? (
              <>
                <Spinner size="sm" />
                <span className="text-slate-500 text-xs">
                  {status === "signing" ? "Deriving viewing key…" : "Scanning pool…"}
                </span>
              </>
            ) : (
              <span className="text-slate-600 text-xs">
                {payments.length} payment{payments.length !== 1 ? "s" : ""} found · auto-refreshes every 10s
              </span>
            )}
          </div>
          {!isScanning && (
            <button
              onClick={refetch}
              className="text-xs font-semibold transition-colors"
              style={{ color: "#a78bfa" }}
              aria-label="Refresh payments"
            >
              Refresh ↺
            </button>
          )}
        </div>
      )}

      {/* Payment list */}
      <ContributorPaymentList
        payments={payments}
        walletAddress={publicKey?.toBase58() ?? ""}
        isScanning={isScanning}
      />
    </div>
  );
}

export default function ContributorPage() {
  return (
    <WalletGuard>
      <ContributorContent />
    </WalletGuard>
  );
}
