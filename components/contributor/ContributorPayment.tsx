"use client";

import type { ContributorPayment } from "@/types";
import { SOLSCAN_TX_URL } from "@/lib/constants";
import { getTokenColor } from "@/lib/design";
import { formatDate, formatNumber, truncateWallet } from "@/lib/utils";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { Badge } from "@/components/ui/Badge";
import { EmptyState as SharedEmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { memo } from "react";

interface PaymentCardProps {
  payment: ContributorPayment;
}

const PaymentCard = memo(function PaymentCard({ payment }: PaymentCardProps) {
  const color = getTokenColor(payment.token);
  return (
    <div
      className="card rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
      role="article"
      aria-label={`Payment of ${payment.amount} ${payment.token}`}
    >
      {/* Token badge */}
      <TokenIcon token={payment.token} size="lg" />

      {/* Amount + meta */}
      <div className="flex-1 min-w-0">
        <p
          className="text-2xl font-bold tabular-nums"
          style={{ color }}
        >
          {formatNumber(payment.amount, 6)}{" "}
          <span className="text-base font-semibold">{payment.token}</span>
        </p>
        <p className="text-slate-500 text-xs mt-0.5">
          {formatDate(payment.timestamp)}
        </p>
      </div>

      {/* Shielded badge + link */}
      <div className="flex items-center gap-3 shrink-0">
        <Badge variant="success">Shielded</Badge>
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
});

interface EmptyStateProps {
  walletAddress: string;
  isScanning: boolean;
}

function EmptyState({ walletAddress, isScanning }: EmptyStateProps) {
  if (isScanning) {
    return (
      <SharedEmptyState
        title="Scanning for payments..."
        description="Checking the shielded pool for transfers addressed to your wallet."
        isLoading
        icon={<Spinner size="md" />}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SharedEmptyState
        title="No shielded payments found"
        description="No incoming shielded transfers were found for this wallet. Payments sent privately via Shieldrexx will appear here automatically."
        icon={
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
            <path
              d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
              stroke="#a78bfa"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />
      <div
        className="rounded-xl px-4 py-3 max-w-sm text-left"
        style={{
          background: "rgba(124,58,237,0.06)",
          border: "1px solid rgba(124,58,237,0.2)",
        }}
      >
        <p className="text-slate-500 text-xs leading-relaxed">
          <span className="text-slate-400 font-medium">Wallet: </span>
          <span className="font-mono">{truncateWallet(walletAddress, 8, 6)}</span>
        </p>
        <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
          Privacy scanning requires the Cloak shielded pool to be active on the connected network.
        </p>
      </div>
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
      {payments.map((p) => (
        <div key={`${p.txSignature}-${p.timestamp}`} role="listitem">
          <PaymentCard payment={p} />
        </div>
      ))}
    </div>
  );
}
