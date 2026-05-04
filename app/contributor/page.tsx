"use client";

import { usePhantom } from "@/components/providers/PhantomProvider";
import { WalletGuard } from "@/components/ui/WalletGuard";
import { useContributorPayments } from "@/hooks/useContributorPayments";
import { ContributorPaymentList } from "@/components/contributor/ContributorPayment";

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
      <div className="mb-8">
        <p className="step-num uppercase tracking-widest mb-1">Contributor View</p>
        <h1 className="text-3xl font-bold text-white">My Payments</h1>
        <p className="text-slate-400 mt-2">
          Only private payments addressed to your connected wallet are shown
          here — nothing else is ever exposed.
        </p>
      </div>

      {/* Privacy notice */}
      <div
        className="card rounded-xl p-4 mb-5 flex items-start gap-3"
        style={{ borderColor: "rgba(124,58,237,0.3)" }}
        role="note"
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
            <path
              d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
              stroke="#a78bfa"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          <span className="text-slate-200 font-medium">Privacy guaranteed. </span>
          Other batch recipients and their amounts are never surfaced here.
          Only your own incoming transfers are decrypted and displayed.
        </p>
      </div>

      {/* Error banner (hard errors only — network/relay empty = empty state) */}
      {status === "error" && error && (
        <div
          className="rounded-xl p-4 mb-5 text-xs flex items-start gap-2"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
          }}
          role="alert"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.5" />
            <path d="M12 8v4m0 4h.01" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      {/* Status bar */}
      {(isScanning || status === "done") && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isScanning ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="rgba(167,139,250,0.3)" strokeWidth="2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
                </svg>
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
