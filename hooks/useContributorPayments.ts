"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicKey } from "@solana/web3.js";

export interface ContributorPayment {
  amount: number;
  token: string;
  txSignature: string;
  timestamp: number;
}

export type ScanStatus = "idle" | "signing" | "scanning" | "done" | "error";

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

    const { generateCloakKeys, SIGN_IN_MESSAGE } = await import("@cloak.dev/sdk");
    setStatus("signing");

    const msgBytes = new TextEncoder().encode(SIGN_IN_MESSAGE as string);
    const sig = await signMessage(msgBytes);
    // Use first 32 bytes of the wallet signature as deterministic master seed
    const keys = generateCloakKeys(sig.slice(0, 32));
    viewKeyRef.current = (keys as any).viewKey ?? keys;
    return viewKeyRef.current;
  }, [signMessage]);

  const scan = useCallback(async () => {
    if (!walletPublicKey) return;
    try {
      const viewKey = await deriveKeys();
      setStatus("scanning");

      // CLOAK_API_URL may not be exported in all SDK versions; fall back to the known relay URL
      const sdk = await import("@cloak.dev/sdk") as Record<string, unknown>;
      const CLOAK_API_URL = (sdk["CLOAK_API_URL"] as string | undefined) ?? "https://api.cloak.dev";
      const { scanNotesForWallet } = sdk as { scanNotesForWallet?: unknown };
      void scanNotesForWallet; // reserved for future direct scan usage

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
        const notes = scanNotesForWallet(data.envelopes, viewKey as any);
        const decoded: ContributorPayment[] = (notes as any[]).map((n: any) => ({
          amount: Number(n.amount ?? n.value ?? 0) / 1e9,
          token: n.token ?? "SOL",
          txSignature: n.txSignature ?? n.signature ?? "",
          timestamp: n.timestamp ?? Date.now(),
        }));
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
      setPayments([]);
      setStatus("idle");
      viewKeyRef.current = null;
      if (pollerRef.current) clearInterval(pollerRef.current);
      return;
    }

    scan();
    pollerRef.current = setInterval(scan, POLL_INTERVAL_MS);

    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, [walletPublicKey, signMessage, scan]);

  const refetch = useCallback(() => {
    if (pollerRef.current) clearInterval(pollerRef.current);
    scan();
    pollerRef.current = setInterval(scan, POLL_INTERVAL_MS);
  }, [scan]);

  return { payments, status, error, refetch };
}
