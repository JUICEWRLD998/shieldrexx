"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicKey } from "@solana/web3.js";
import type { ContributorPayment, ScanStatus } from "@/types";

interface CloakKeysResult {
  viewKey?: unknown;
}

interface CloakScanSdk {
  CLOAK_API_URL?: string;
  scanNotesForWallet?: (envelopes: string[], viewKey: unknown) => unknown[];
}

interface CloakKeygenSdk {
  generateCloakKeys: (seed: Uint8Array) => CloakKeysResult;
  SIGN_IN_MESSAGE: string;
}

const POLL_INTERVAL_MS = 10_000;

/**
 * Scans for incoming shielded payments addressed to the connected wallet.
 *
 * Flow:
 *  1. Ask wallet to sign SIGN_IN_MESSAGE once → derive CloakKeyPair (cached)
 *  2. Call relay GET /incoming?pubkey=... to fetch encrypted chain note envelopes
 *  3. Scan envelopes with scanNotesForWallet using the derived view key
 *  4. Poll every 10 s for new deposits
 *
 * NOTE: The shielded pool and relay are mainnet-only. On devnet this will
 * return an empty list. The architecture is correct — it lights up when
 * the pool is live and the sender embeds chain note envelopes in the tx.
 */
export function useContributorPayments(
  walletPublicKey: PublicKey | null,
  signMessage: ((msg: Uint8Array) => Promise<Uint8Array>) | null
) {
  const [payments, setPayments] = useState<ContributorPayment[]>([]);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Cache derived viewing key so we only sign once per wallet session
  const viewKeyRef = useRef<unknown>(null);
  const pollerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive viewing key from wallet signature (sign-in once)
  const deriveKeys = useCallback(async () => {
    if (!signMessage) throw new Error("Wallet does not support signMessage.");
    if (viewKeyRef.current) return viewKeyRef.current;

    const { generateCloakKeys, SIGN_IN_MESSAGE } =
      (await import("@cloak.dev/sdk")) as unknown as CloakKeygenSdk;
    setStatus("signing");

    const msgBytes = new TextEncoder().encode(SIGN_IN_MESSAGE);
    const sig = await signMessage(msgBytes);
    // Use first 32 bytes of the wallet signature as deterministic master seed
    const keys = generateCloakKeys(sig.slice(0, 32));
    viewKeyRef.current = keys.viewKey ?? keys;
    return viewKeyRef.current;
  }, [signMessage]);

  const scan = useCallback(async () => {
    if (!walletPublicKey) return;
    try {
      const viewKey = await deriveKeys();
      setStatus("scanning");

      // CLOAK_API_URL may not be exported in all SDK versions; fall back to the known relay URL
      const sdk = (await import("@cloak.dev/sdk")) as unknown as CloakScanSdk;
      const CLOAK_API_URL = sdk.CLOAK_API_URL ?? "https://api.cloak.dev";
      const scanNotesForWallet = sdk.scanNotesForWallet;

      // Fetch encrypted chain note envelopes from the relay
      const res = await fetch(
        `${CLOAK_API_URL as string}/incoming?pubkey=${walletPublicKey.toBase58()}`,
        { method: "GET", signal: AbortSignal.timeout(8_000) }
      );

      if (res.status === 404) {
        // Relay has no notes for this wallet — valid empty state
        setPayments([]);
        setStatus("done");
        return;
      }
      if (!res.ok) {
        throw new Error(`Relay ${res.status}: ${res.statusText}`);
      }

      const data = (await res.json()) as {
        envelopes?: string[];
        payments?: ContributorPayment[];
      };

      // If relay returns raw envelopes, trial-decrypt them
      if (data.envelopes?.length) {
        if (!scanNotesForWallet) {
          throw new Error("scanNotesForWallet is unavailable in this Cloak SDK version.");
        }
        const notes = scanNotesForWallet(data.envelopes, viewKey);
        const decoded: ContributorPayment[] = notes.map((note) => {
          const n = note as Record<string, unknown>;
          const rawAmount = n.amount ?? n.value ?? 0;
          const amountNumber = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);
          return {
            amount: amountNumber / 1e9,
            token: typeof n.token === "string" ? n.token : "SOL",
            txSignature:
              typeof n.txSignature === "string"
                ? n.txSignature
                : typeof n.signature === "string"
                ? n.signature
                : "",
            timestamp: typeof n.timestamp === "number" ? n.timestamp : Date.now(),
          };
        });
        setPayments(decoded);
      } else if (data.payments) {
        // Relay may return pre-decoded payments directly
        setPayments(data.payments);
      } else {
        setPayments([]);
      }

      setStatus("done");
      setError(null);
    } catch (err) {
      // Relay unavailable or pool not initialized on this network — graceful empty state
      const msg = err instanceof Error ? err.message : "Scan failed.";
      // Don't surface relay fetch failures as hard errors — show empty state instead
      const isNetworkError =
        msg.includes("fetch") ||
        msg.includes("404") ||
        msg.includes("Failed to fetch") ||
        msg.includes("Relay");
      if (isNetworkError) {
        setPayments([]);
        setStatus("done");
      } else {
        setError(msg);
        setStatus("error");
      }
    }
  }, [walletPublicKey, deriveKeys]);

  // Initial scan + polling
  useEffect(() => {
    if (!walletPublicKey || !signMessage) {
      viewKeyRef.current = null;
      if (pollerRef.current) clearInterval(pollerRef.current);
      return;
    }

    const kickoffTimer = setTimeout(() => {
      void scan();
    }, 0);
    pollerRef.current = setInterval(() => {
      void scan();
    }, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(kickoffTimer);
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, [walletPublicKey, signMessage, scan]);

  const refetch = useCallback(() => {
    if (!walletPublicKey || !signMessage) return;
    if (pollerRef.current) clearInterval(pollerRef.current);
    scan();
    pollerRef.current = setInterval(scan, POLL_INTERVAL_MS);
  }, [scan, signMessage, walletPublicKey]);

  return {
    payments: walletPublicKey && signMessage ? payments : [],
    status: walletPublicKey && signMessage ? status : "idle",
    error,
    refetch,
  };
}
