"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Connection } from "@solana/web3.js";
import type { TransactionStatus } from "@/types";

const DEFAULT_POLL_MS = 5_000;

interface UseLiveTransactionStatusOptions {
  connection: Connection | null;
  signature: string | null;
  enabled?: boolean;
  pollIntervalMs?: number;
}

interface UseLiveTransactionStatusResult {
  txStatus: TransactionStatus | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refetch: () => Promise<void>;
}

function toReadableStatus(raw: string | null, hasError: boolean): TransactionStatus["status"] {
  if (hasError) return "failed";
  if (raw === "finalized") return "finalized";
  if (raw === "confirmed") return "confirmed";
  return "pending";
}

export function useLiveTransactionStatus({
  connection,
  signature,
  enabled = true,
  pollIntervalMs = DEFAULT_POLL_MS,
}: UseLiveTransactionStatusOptions): UseLiveTransactionStatusResult {
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const canTrack = useMemo(
    () => Boolean(connection && signature && enabled),
    [connection, enabled, signature]
  );

  const fetchStatus = useCallback(async () => {
    if (!connection || !signature || !enabled) return;

    setIsLoading(true);
    try {
      const statuses = await connection.getSignatureStatuses([signature], {
        searchTransactionHistory: true,
      });

      const statusInfo = statuses.value[0];
      if (!statusInfo) {
        const pendingStatus: TransactionStatus = {
          signature,
          status: "pending",
          confirmations: 0,
          slot: 0,
          fee: 0,
          timestamp: Date.now(),
        };
        setTxStatus(pendingStatus);
        setError(null);
        setLastUpdated(Date.now());
        return;
      }

      const tx = await connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      const confirmations =
        typeof statusInfo.confirmations === "number"
          ? statusInfo.confirmations
          : statusInfo.confirmationStatus === "finalized"
          ? 32
          : 0;

      const mapped: TransactionStatus = {
        signature,
        status: toReadableStatus(statusInfo.confirmationStatus ?? null, Boolean(statusInfo.err)),
        confirmations,
        slot: statusInfo.slot,
        fee: tx?.meta?.fee ?? 0,
        timestamp: (tx?.blockTime ?? Math.floor(Date.now() / 1000)) * 1000,
      };

      setTxStatus(mapped);
      setError(null);
      setLastUpdated(Date.now());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to track transaction";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [connection, enabled, signature]);

  useEffect(() => {
    if (!canTrack) return;

    const kickoff = setTimeout(() => {
      void fetchStatus();
    }, 0);

    const poller = setInterval(() => {
      void fetchStatus();
    }, pollIntervalMs);

    return () => {
      clearTimeout(kickoff);
      clearInterval(poller);
    };
  }, [canTrack, fetchStatus, pollIntervalMs]);

  return {
    txStatus,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchStatus,
  };
}
