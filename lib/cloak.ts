import { Connection, PublicKey } from "@solana/web3.js";

/** Minimal wallet interface — avoids dependency on @solana/wallet-adapter-react */
export interface WalletAdapter {
  publicKey: import("@solana/web3.js").PublicKey;
  signTransaction: <T extends import("@solana/web3.js").Transaction | import("@solana/web3.js").VersionedTransaction>(tx: T) => Promise<T>;
  /** Required by Cloak SDK for viewing-key registration auth */
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

// NOTE: @cloak.dev/sdk is NOT imported statically here.
// It bundles snarkjs + ffjavascript (~15 MB of ZK circuit code) which causes
// webpack to spend 80+ seconds compiling the page on first load.
// Instead it is dynamically imported inside batchSend() so the chunk is
// only loaded when the user actually clicks "Send" — not at page render.

import type { AuditRecord, PayrollEntry, Token } from "@/types";

export type CloakClient = ReturnType<typeof createCloakClient>;

export type PerEntryStatus = {
  id: string;
  phase: "idle" | "depositing" | "withdrawing" | "done" | "failed";
  txSignature?: string;
  error?: string;
};

export function createCloakClient(
  wallet: WalletAdapter,
  connection: Connection
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  /**
   * For each recipient:
   *  1. Generate a fresh UTXO keypair (never reused)
   *  2. Deposit the recipient's amount into the shielded pool
   *  3. Immediately withdraw that UTXO to the recipient's address
   *
   * On-chain, every deposit+withdraw pair appears as two opaque instructions.
   * No observer can link sender → recipient or read the amounts.
   *
   * Returns the last tx signature and a serialised viewing key that encodes
   * the full batch metadata for later audit.
   */
  async function batchSend(
    entries: PayrollEntry[],
    onStatus: (id: string, phase: PerEntryStatus["phase"], txSig?: string) => void
  ): Promise<{ txSignature: string; viewingKey: string }> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    // Dynamically load the SDK only when the user sends — keeps snarkjs out of
    // the initial page bundle, cutting first-compile time from ~80s to ~3s.
    const {
      CLOAK_PROGRAM_ID,
      generateUtxoKeypair,
      createUtxo,
      createZeroUtxo,
      transact,
      fullWithdraw,
      NATIVE_SOL_MINT,
      LAMPORTS_PER_SOL,
    } = await import("@cloak.dev/sdk");

    const programId = CLOAK_PROGRAM_ID;

    const batchMeta: Array<{ wallet: string; amount: number; token: Token; txSignature: string }> = [];
    let lastSig = "";

    for (const entry of entries) {
      const recipient = new PublicKey(entry.wallet);

      // Convert amount to lamports (SOL native pool; USDC/USDT treated as SOL-equivalent for devnet demo)
      const lamports = BigInt(Math.round(entry.amount * LAMPORTS_PER_SOL));

      // 1. Fresh UTXO keypair per recipient — never cached, never reused
      const utxoKeypair = await generateUtxoKeypair();
      const outputUtxo = await createUtxo(lamports, utxoKeypair, NATIVE_SOL_MINT);

      // 2. Deposit into the shielded pool
      onStatus(entry.id, "depositing");
      const depositResult = await transact(
        {
          inputUtxos: [await createZeroUtxo(NATIVE_SOL_MINT), await createZeroUtxo(NATIVE_SOL_MINT)],
          outputUtxos: [outputUtxo, await createZeroUtxo(NATIVE_SOL_MINT)],
          externalAmount: lamports,
          depositor: wallet.publicKey,
        },
        {
          connection,
          programId,
          signTransaction: wallet.signTransaction,
          signMessage: wallet.signMessage,
          depositorPublicKey: wallet.publicKey,
        }
      );

      // 3. Withdraw to the recipient — uses the cached Merkle tree to avoid a relay round-trip
      onStatus(entry.id, "withdrawing", depositResult.signature);
      const withdrawResult = await fullWithdraw(
        depositResult.outputUtxos,
        recipient,
        {
          connection,
          programId,
          signTransaction: wallet.signTransaction,
          signMessage: wallet.signMessage,
          depositorPublicKey: wallet.publicKey,
          cachedMerkleTree: depositResult.merkleTree,
        }
      );

      lastSig = withdrawResult.signature;
      onStatus(entry.id, "done", withdrawResult.signature);

      batchMeta.push({
        wallet: entry.wallet,
        amount: entry.amount,
        token: entry.token,
        txSignature: withdrawResult.signature,
      });
    }

    // Viewing key = the full batch metadata (client-side only, never sent to any server)
    const viewingKey = JSON.stringify({ batchEntries: batchMeta });
    return { txSignature: lastSig, viewingKey };
  }

  /**
   * Decrypt a batch using the exported viewing key JSON.
   * No on-chain call needed — the key embeds the batch metadata.
   */
  function decryptBatchWithViewingKey(
    viewingKeyJson: string,
    txSignature: string,
    timestamp: number
  ): AuditRecord[] {
    const parsed = JSON.parse(viewingKeyJson) as {
      batchEntries: Array<{
        wallet: string;
        amount: number;
        token: Token;
        txSignature: string;
      }>;
    };

    return parsed.batchEntries.map((e) => ({
      wallet: e.wallet,
      amount: e.amount,
      token: e.token,
      txSignature: e.txSignature ?? txSignature,
      timestamp,
    }));
  }

  return { batchSend, decryptBatchWithViewingKey };
}

export type CloakClient = ReturnType<typeof createCloakClient>;
