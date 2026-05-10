"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Connection } from "@solana/web3.js";
import { createCloakClient, type PerEntryStatus, type WalletAdapter } from "@/lib/cloak";
import { saveViewingKey } from "@/lib/viewingKey";
import type { BatchResult, PayrollEntry } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { SOLSCAN_TX_URL } from "@/lib/constants";

export type BatchStatus = "idle" | "running" | "success" | "failed";

export interface UseCloakBatchReturn {
  status: BatchStatus;
  entryStatuses: PerEntryStatus[];
  batchResult: BatchResult | null;
  error: string | null;
  run: (entries: PayrollEntry[]) => Promise<void>;
  reset: () => void;
  solscanUrl: (sig: string) => string;
}

export function useCloakBatch(
  wallet: WalletAdapter | null,
  connection: Connection | null
): UseCloakBatchReturn {
  const [status, setStatus] = useState<BatchStatus>("idle");
  const [entryStatuses, setEntryStatuses] = useState<PerEntryStatus[]>([]);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use ref to avoid stale closures inside the loop
  const entryStatusesRef = useRef<PerEntryStatus[]>([]);

  const client = useMemo(() => {
    if (!wallet?.publicKey || !wallet?.signTransaction || !connection) return null;
    try {
      return createCloakClient(wallet as WalletAdapter, connection);
    } catch {
      return null;
    }
  }, [wallet, connection]);

  const updateEntryStatus = useCallback(
    (id: string, phase: PerEntryStatus["phase"], txSig?: string) => {
      entryStatusesRef.current = entryStatusesRef.current.map((s) =>
        s.id === id ? { ...s, phase, txSignature: txSig ?? s.txSignature } : s
      );
      setEntryStatuses([...entryStatusesRef.current]);
    },
    []
  );

  const run = useCallback(
    async (entries: PayrollEntry[]) => {
      if (!client) {
        setError("Wallet not connected or client unavailable.");
        return;
      }
      if (entries.length === 0) {
        setError("No entries to send.");
        return;
      }

      // Initialise per-entry status
      const initial: PerEntryStatus[] = entries.map((e) => ({
        id: e.id,
        phase: "idle",
      }));
      entryStatusesRef.current = initial;
      setEntryStatuses(initial);
      setStatus("running");
      setError(null);
      setBatchResult(null);

      try {
        const { txSignature, viewingKey } = await client.batchSend(
          entries,
          (id, phase, txSig) => updateEntryStatus(id, phase, txSig)
        );

        const batchId = uuidv4();
        const timestamp = Date.now();

        const result: BatchResult = {
          txSignature,
          timestamp,
          entries: entries.map((e) => ({ ...e, status: "sent" })),
          viewingKey,
        };

        // Persist viewing key to localStorage (never leaves the browser)
        saveViewingKey(batchId, result);

        setBatchResult(result);
        setStatus("success");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Unknown error during batch send.";
        setError(msg);
        setStatus("failed");

        // Mark all still-running entries as failed
        entryStatusesRef.current = entryStatusesRef.current.map((s) =>
          s.phase !== "done" ? { ...s, phase: "failed", error: msg } : s
        );
        setEntryStatuses([...entryStatusesRef.current]);
      }
    },
    [client, updateEntryStatus]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setEntryStatuses([]);
    setBatchResult(null);
    setError(null);
    entryStatusesRef.current = [];
  }, []);

  return useMemo(
    () => ({
      status,
      entryStatuses,
      batchResult,
      error,
      run,
      reset,
      solscanUrl: SOLSCAN_TX_URL,
    }),
    [batchResult, entryStatuses, error, reset, run, status]
  );
}
