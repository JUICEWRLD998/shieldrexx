"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { type ReactNode } from "react";

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="url(#wg)" />
      <path
        d="M8 11V7a4 4 0 0 1 8 0v4"
        stroke="url(#wg)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1.5" fill="white" />
      <defs>
        <linearGradient id="wg" x1="5" y1="1" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function WalletGuard({ children }: { children: ReactNode }) {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div
        className="flex flex-col flex-1 items-center justify-center px-4 py-20"
        role="main"
        aria-label="Connect wallet to continue"
      >
        <div className="card rounded-2xl p-10 max-w-sm w-full text-center flex flex-col items-center gap-6">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(109,40,217,0.15)",
              border: "1px solid rgba(124,58,237,0.35)",
              boxShadow: "0 0 32px rgba(124,58,237,0.2)",
            }}
            aria-hidden="true"
          >
            <LockIcon />
          </div>

          {/* Copy */}
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Wallet required
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connect your Solana wallet to access this page. Make sure it is
              set to{" "}
              <span className="text-violet-400 font-semibold">Devnet</span> for
              testing.
            </p>
          </div>

          {/* Connect button */}
          <WalletMultiButton
            style={{
              width: "100%",
              justifyContent: "center",
              borderRadius: "10px",
            }}
          />

          <p className="text-slate-600 text-xs">
            Phantom, Solflare, and other standard Solana wallets are supported.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
