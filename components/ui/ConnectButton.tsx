"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useToast } from "@/components/providers/ToastProvider";

function shorten(pk: string) {
  return `${pk.slice(0, 4)}...${pk.slice(-4)}`;
}

export function ConnectButton() {
  const [mounted, setMounted] = useState(false);
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { toast } = useToast();

  const [prevConnected, setPrevConnected] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (connected && !prevConnected) {
      toast({
        type: "success",
        title: "Wallet connected",
        message: publicKey ? shorten(publicKey.toString()) : undefined,
      });
    } else if (!connected && prevConnected) {
      toast({ type: "info", title: "Wallet disconnected" });
    }
    setPrevConnected(connected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  async function handleDisconnect() {
    try {
      await disconnect();
    } catch {
      toast({ type: "error", title: "Disconnect failed" });
    }
  }

  // Skeleton
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
        onClick={handleDisconnect}
        className="group flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono font-medium transition-all"
        style={{
          background: "rgba(109,40,217,0.18)",
          border: "1px solid rgba(124,58,237,0.4)",
          color: "#c4b5fd",
        }}
        aria-label={`Disconnect wallet ${publicKey.toString()}`}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0 group-hover:hidden"
          style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}
          aria-hidden="true"
        />
        <span className="hidden group-hover:inline text-red-400 text-xs font-bold shrink-0" aria-hidden="true">
          x
        </span>
        <span className="group-hover:hidden">{shorten(publicKey.toString())}</span>
        <span className="hidden group-hover:inline" style={{ color: "#f87171", fontFamily: "inherit" }}>
          Disconnect
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="btn-primary px-4 py-1.5 text-sm font-semibold rounded-xl"
      aria-label="Connect wallet"
    >
      Connect Wallet
    </button>
  );
}
