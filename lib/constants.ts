import { PublicKey } from "@solana/web3.js";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

// Devnet USDC mint — Circle's official devnet mint
export const USDC_DEVNET_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_DEVNET_MINT ??
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

// Cloak program ID from docs: zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW
export const CLOAK_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_CLOAK_PROGRAM_ID ??
    "zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW"
);

export const SOLSCAN_BASE = "https://solscan.io/tx";

export const SOLSCAN_TX_URL = (sig: string) =>
  `${SOLSCAN_BASE}/${sig}?cluster=devnet`;

export const SUPPORTED_TOKENS = ["USDC", "USDT", "SOL"] as const;
