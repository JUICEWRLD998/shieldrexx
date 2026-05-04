import Papa from "papaparse";
import { PublicKey } from "@solana/web3.js";
import { v4 as uuidv4 } from "uuid";
import type { PayrollEntry, Token } from "@/types";

const SUPPORTED_TOKENS: Token[] = ["USDC", "USDT", "SOL"];

function isValidWallet(address: string): boolean {
  try {
    const pk = new PublicKey(address);
    return PublicKey.isOnCurve(pk.toBytes());
  } catch {
    return false;
  }
}

function normalizeToken(raw: string): Token | null {
  const t = raw.trim().toUpperCase() as Token;
  return SUPPORTED_TOKENS.includes(t) ? t : null;
}

export interface ParseResult {
  entries: PayrollEntry[];
  errors: string[];
}

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const entries: PayrollEntry[] = [];
        const errors: string[] = [];

        if (results.data.length === 0) {
          errors.push("CSV file is empty or has no data rows.");
          resolve({ entries, errors });
          return;
        }

        results.data.forEach((row, i) => {
          const rowNum = i + 2; // 1-indexed; row 1 = header
          const wallet = (row["wallet"] ?? "").trim();
          const rawAmount = (row["amount"] ?? "").trim();
          const rawToken = (row["token"] ?? "").trim();
          const label = (row["label"] ?? "").trim() || undefined;

          if (!wallet) {
            errors.push(`Row ${rowNum}: missing wallet address.`);
            return;
          }
          if (!isValidWallet(wallet)) {
            errors.push(
              `Row ${rowNum}: "${wallet.slice(0, 12)}…" is not a valid Solana address.`
            );
            return;
          }

          const amount = parseFloat(rawAmount);
          if (isNaN(amount) || amount <= 0) {
            errors.push(`Row ${rowNum}: invalid amount "${rawAmount}" — must be a positive number.`);
            return;
          }

          const token = normalizeToken(rawToken);
          if (!token) {
            errors.push(
              `Row ${rowNum}: unsupported token "${rawToken}" — accepted values: USDC, USDT, SOL.`
            );
            return;
          }

          entries.push({ id: uuidv4(), wallet, amount, token, label, status: "pending" });
        });

        resolve({ entries, errors });
      },
      error(err) {
        resolve({ entries: [], errors: [`Failed to parse CSV: ${err.message}`] });
      },
    });
  });
}
