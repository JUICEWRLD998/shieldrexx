"use client";

import { useCallback, useState } from "react";
import type { AuditRecord, Token } from "@/types";

interface ViewingKeyPayload {
  batchEntries: Array<{
    wallet: string;
    amount: number;
    token: Token;
    txSignature: string;
  }>;
}

export interface ImportedBatch {
  records: AuditRecord[];
  /** Last tx signature in the batch (used for Solscan link) */
  txSignature: string;
  /** When the key was imported (browser-local timestamp) */
  timestamp: number;
  recipientCount: number;
}

export type ImportStatus = "idle" | "success" | "error";

export function useViewingKey() {
  const [batch, setBatch] = useState<ImportedBatch | null>(null);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const importKey = useCallback((keyJson: string) => {
    try {
      const trimmed = keyJson.trim();
      if (!trimmed) throw new Error("Paste a viewing key to continue.");

      let parsed: ViewingKeyPayload;
      try {
        parsed = JSON.parse(trimmed) as ViewingKeyPayload;
      } catch {
        throw new Error("Not valid JSON. Copy the key exactly as exported.");
      }

      if (
        !parsed.batchEntries ||
        !Array.isArray(parsed.batchEntries) ||
        parsed.batchEntries.length === 0
      ) {
        throw new Error(
          "Invalid viewing key: batchEntries missing or empty."
        );
      }

      const timestamp = Date.now();
      const records: AuditRecord[] = parsed.batchEntries.map((e, i) => {
        if (!e.wallet || typeof e.amount !== "number" || !e.token) {
          throw new Error(`Entry ${i + 1} is malformed — wallet, amount, or token missing.`);
        }
        return {
          wallet: e.wallet,
          amount: e.amount,
          token: e.token,
          txSignature: e.txSignature ?? "",
          timestamp,
        };
      });

      const lastEntry = parsed.batchEntries[parsed.batchEntries.length - 1];

      setBatch({
        records,
        txSignature: lastEntry.txSignature ?? "",
        timestamp,
        recipientCount: records.length,
      });
      setStatus("success");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse viewing key.");
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setBatch(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { batch, status, error, importKey, reset };
}
