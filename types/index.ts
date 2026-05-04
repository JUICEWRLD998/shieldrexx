export type Token = "USDC" | "USDT" | "SOL";

export interface PayrollEntry {
  id: string;
  wallet: string;
  amount: number;
  token: Token;
  status: "pending" | "sent" | "failed";
}

export interface BatchResult {
  txSignature: string;
  timestamp: number;
  entries: PayrollEntry[];
  viewingKey: string;
}

export interface AuditRecord {
  wallet: string;
  amount: number;
  token: Token;
  txSignature: string;
  timestamp: number;
}
