"use client";

/**
 * PhantomProvider — compatibility shim over @solana/wallet-adapter-react.
 *
 * All existing usePhantom() call sites continue to work unchanged.
 * The real wallet state comes from WalletProvider (in SolanaProviders.tsx).
 * This file just exposes the same PhantomCtx interface so no other file
 * needs to be touched.
 */

import { type ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { type Transaction, type VersionedTransaction } from "@solana/web3.js";
import type { Connection, PublicKey } from "@solana/web3.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PhantomCtx {
  connected: boolean;
  publicKey: PublicKey | null;
  connection: Connection;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: <T extends Transaction>(tx: T) => Promise<T>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

// ---------------------------------------------------------------------------
// PhantomProvider — no-op wrapper (WalletProvider is the real provider)
// ---------------------------------------------------------------------------

export function PhantomProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// usePhantom — thin shim over useWallet + useConnection
// ---------------------------------------------------------------------------

export function usePhantom(): PhantomCtx {
  const { connected, publicKey, connect, disconnect, signTransaction, signMessage } = useWallet();
  const { connection } = useConnection();

  return {
    connected,
    publicKey: publicKey ?? null,
    connection,

    connect: async () => {
      await connect();
    },

    disconnect: async () => {
      await disconnect();
    },

    // The adapter's signTransaction is typed to handle both Transaction and
    // VersionedTransaction. We cast here to match the legacy generic signature
    // used by lib/cloak.ts — safe because Cloak only uses legacy Transaction.
    signTransaction: signTransaction
      ? (tx) =>
          (signTransaction as (tx: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>)(
            tx
          ) as Promise<typeof tx>
      : () => Promise.reject(new Error("Wallet not connected")),

    signMessage: signMessage
      ? (msg) => signMessage(msg)
      : () => Promise.reject(new Error("Wallet not connected")),
  };
}
