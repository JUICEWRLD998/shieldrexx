"use client";

import { useEffect, useState } from "react";
import { usePhantom } from "@/components/providers/PhantomProvider";

function shorten(pk: string) {
  return `${pk.slice(0, 4)}…${pk.slice(-4)}`;
}

/**
 * Client-only wallet button.
 *
 * The `mounted` guard ensures the server renders a skeleton (no wallet state),
 * and React hydrates without any SSR/CSR mismatch. Phantom extension attribute
 * injection (jf-observer-attached, jf-ext-button-ct) is handled by
 * suppressHydrationWarning on <body> in layout.tsx.
 */
export function ConnectButton() {
  const [mounted, setMounted] = useState(false);
  const { connected, publicKey, connect, disconnect } = usePhantom();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Skeleton — matches dimensions of the real button so layout doesn't shift
  if (!mounted) {
    return (
      <div
        className="h-9 w-36 rounded-xl"
        style={{ background: "rgba(109,40,217,0.15)" }}
        aria-hidden="true"
      />
    );
  }

  if (connected && publicKey) {
    return (
      <button
        onClick={disconnect}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono font-medium transition-all"
        style={{
          background: "rgba(109,40,217,0.18)",
          border: "1px solid rgba(124,58,237,0.4)",
          color: "#c4b5fd",
        }}
        aria-label={`Disconnect wallet ${publicKey.toString()}`}
      >
        {/* Green dot */}
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}
          aria-hidden="true"
        />
        {shorten(publicKey.toString())}
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      className="btn-primary px-4 py-1.5 text-sm font-semibold rounded-xl"
      aria-label="Connect Phantom wallet"
    >
      Connect Wallet
    </button>
  );
}
