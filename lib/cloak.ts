import { Connection } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  CLOAK_PROGRAM_ID,
  generateUtxoKeypair,
  createUtxo,
  createZeroUtxo,
  transact,
  fullWithdraw,
  NATIVE_SOL_MINT,
} from "@cloak.dev/sdk";
import type { AuditRecord, PayrollEntry, Token } from "@/types";
import { PublicKey } from "@solana/web3.js";

export type CloakClient = ReturnType<typeof createCloakClient>;

export function createCloakClient(
  wallet: WalletContextState,
  connection: Connection
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const programId = CLOAK_PROGRAM_ID;

  /**
   * Deposit funds into the shielded pool, then privately send to recipients.
   * Returns the tx signature and a serialised viewing key (the exported UTXO keypairs).
   */
  async function batchSend(
    entries: PayrollEntry[],
    grossLamports: bigint
  ): Promise<{ txSignature: string; viewingKey: string }> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    // 1. Generate a fresh UTXO keypair for this batch (never reused)
    const owner = await generateUtxoKeypair();
    const depositOutput = await createUtxo(
      grossLamports,
      owner,
      NATIVE_SOL_MINT
    );

    // 2. Deposit into shielded pool
    const deposited = await transact(
      {
        inputUtxos: [await createZeroUtxo(NATIVE_SOL_MINT)],
        outputUtxos: [depositOutput],
        externalAmount: grossLamports,
        depositor: wallet.publicKey,
      },
      {
        connection,
        programId,
        walletPublicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
      }
    );

    // 3. Withdraw to each recipient in sequence (Cloak hides amount per output)
    let lastSig = deposited.signature;
    for (const entry of entries) {
      const recipient = new PublicKey(entry.wallet);
      const result = await fullWithdraw(
        deposited.outputUtxos,
        recipient,
        {
          connection,
          programId,
          walletPublicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          cachedMerkleTree: deposited.merkleTree,
        }
      );
      lastSig = result.signature;
    }

    // 4. Viewing key = exported UTXO owner keypair JSON (client-side only)
    const viewingKey = JSON.stringify({
      owner: Array.from(owner.secretKey ?? owner),
      batchEntries: entries.map((e) => ({
        wallet: e.wallet,
        amount: e.amount,
        token: e.token,
        label: e.label,
      })),
    });

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
        label?: string;
      }>;
    };

    return parsed.batchEntries.map((e) => ({
      wallet: e.wallet,
      amount: e.amount,
      token: e.token,
      label: e.label,
      txSignature,
      timestamp,
    }));
  }

  return { batchSend, decryptBatchWithViewingKey };
}
