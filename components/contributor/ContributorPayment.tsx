"use client";

import type { ContributorPayment } from "@/hooks/useContributorPayments";
import { SOLSCAN_TX_URL } from "@/lib/constants";

const TOKEN_COLOR: Record<string, string> = {
  USDC: "#4ade80",
  USDT: "#34d399",
  SOL: "#a78bfa",
};

interface PaymentCardProps {
  payment: ContributorPayment;
}

function PaymentCard({ payment }: PaymentCardProps) {
  const color = TOKEN_COLOR[payment.token] ?? "#94a3b8";
  return (
    <div
      className="card rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
      role="article"
      aria-label={`Payment of ${payment.amount} ${payment.token}`}
    >
      {/* Token badge */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}40`,
          color,
        }}
        aria-hidden="true"
      >
        {payment.token}
      </div>

      {/* Amount + meta */}
      <div className="flex-1 min-w-0">
        <p
          className="text-2xl font-bold tabular-nums"
          style={{ color }}
        >
          {payment.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
          <span className="text-base font-semibold">{payment.token}</span>
        </p>
        <p className="text-slate-500 text-xs mt-0.5">
          {new Date(payment.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Shielded badge + link */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="badge text-xs"
          style={{ background: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          Shielded
        </span>
        {payment.txSignature && (
          <a
            href={SOLSCAN_TX_URL(payment.txSignature)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold transition-colors"
            style={{ color: "#a78bfa" }}
            aria-label="View on Solscan"
          >
            Solscan ↗
          </a>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  walletAddress: string;
  isScanning: boolean;
}

function EmptyState({ walletAddress, isScanning }: EmptyStateProps) {
  return (
    <div
      className="card rounded-2xl flex flex-col items-center justify-center text-center gap-5 p-12"
      style={{ minHeight: "280px" }}
      role="status"
      aria-live="polite"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(109,40,217,0.1)",
          border: "2px dashed rgba(124,58,237,0.35)",
        }}
        aria-hidden="true"
      >
        {isScanning ? (
          <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="rgba(167,139,250,0.3)" strokeWidth="2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
            <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
              stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div>
        <p className="text-slate-300 font-semibold mb-1">
          {isScanning ? "Scanning for payments…" : "No shielded payments found"}
        </p>
        <p className="text-slate-600 text-sm max-w-xs mx-auto leading-relaxed">
          {isScanning
            ? "Checking the shielded pool for transfers addressed to your wallet."
            : "No incoming shielded transfers were found for this wallet. Payments sent privately via Shieldrexx will appear here automatically."}
        </p>
      </div>

      {!isScanning && (
        <div
          className="rounded-xl px-4 py-3 max-w-sm text-left"
          style={{
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <p className="text-slate-500 text-xs leading-relaxed">
            <span className="text-slate-400 font-medium">Wallet: </span>
            <span className="font-mono">
              {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
            </span>
          </p>
          <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
            Privacy scanning requires the Cloak shielded pool to be active on the connected network.
          </p>
        </div>
      )}
    </div>
  );
}

interface ContributorPaymentListProps {
  payments: ContributorPayment[];
  walletAddress: string;
  isScanning: boolean;
}

export function ContributorPaymentList({
  payments,
  walletAddress,
  isScanning,
}: ContributorPaymentListProps) {
  if (payments.length === 0) {
    return <EmptyState walletAddress={walletAddress} isScanning={isScanning} />;
  }

  return (
    <div className="flex flex-col gap-3" role="list" aria-label="Incoming shielded payments">
      {payments.map((p, i) => (
        <div key={i} role="listitem">
          <PaymentCard payment={p} />
        </div>
      ))}
    </div>
  );
}
