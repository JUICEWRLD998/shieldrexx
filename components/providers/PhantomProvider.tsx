"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Connection, PublicKey, type Transaction } from "@solana/web3.js";
import { SOLANA_RPC_URL } from "@/lib/constants";

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
// Helpers
// ---------------------------------------------------------------------------

function getPhantom() {
  if (typeof window === "undefined") return null;
  return (window as any).phantom?.solana ?? null;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const PhantomContext = createContext<PhantomCtx | null>(null);

export function PhantomProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  const connection = useMemo(
    () => new Connection(SOLANA_RPC_URL, "confirmed"),
    []
  );

  // Attach Phantom event listeners and attempt eager reconnect
  useEffect(() => {
    const phantom = getPhantom();
    if (!phantom) return;

    const onConnect = (pk: PublicKey) => setPublicKey(pk);
    const onDisconnect = () => setPublicKey(null);
    const onAccountChanged = (pk: PublicKey | null) => {
      setPublicKey(pk);
      if (!pk) phantom.connect({ onlyIfTrusted: true }).catch(() => {});
    };

    phantom.on("connect", onConnect);
    phantom.on("disconnect", onDisconnect);
    phantom.on("accountChanged", onAccountChanged);

    // Eager reconnect — silently fails if not previously approved
    phantom.connect({ onlyIfTrusted: true }).catch(() => {});

    return () => {
      phantom.off("connect", onConnect);
      phantom.off("disconnect", onDisconnect);
      phantom.off("accountChanged", onAccountChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    const phantom = getPhantom();
    if (!phantom) {
      // Phantom not installed — open install page
      window.open("https://phantom.app/", "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const resp = await phantom.connect();
      setPublicKey(resp.publicKey);
    } catch {
      // User rejected
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await getPhantom()?.disconnect();
    } finally {
      setPublicKey(null);
    }
  }, []);

  const signTransaction = useCallback(async <T extends Transaction>(tx: T): Promise<T> => {
    const phantom = getPhantom();
    if (!phantom) throw new Error("Phantom not installed");
    return phantom.signTransaction(tx) as Promise<T>;
  }, []);

  const signMessage = useCallback(async (message: Uint8Array): Promise<Uint8Array> => {
    const phantom = getPhantom();
    if (!phantom) throw new Error("Phantom not installed");
    const { signature } = await phantom.signMessage(message, "utf8");
    return signature as Uint8Array;
  }, []);

  const value = useMemo<PhantomCtx>(
    () => ({
      connected: !!publicKey,
      publicKey,
      connection,
      connect,
      disconnect,
      signTransaction,
      signMessage,
    }),
    [publicKey, connection, connect, disconnect, signTransaction, signMessage]
  );

  return (
    <PhantomContext.Provider value={value}>{children}</PhantomContext.Provider>
  );
}

export function usePhantom(): PhantomCtx {
  const ctx = useContext(PhantomContext);
  if (!ctx) throw new Error("usePhantom must be used inside <PhantomProvider>");
  return ctx;
}
