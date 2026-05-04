export type Token = "USDC" | "USDT" | "SOL";

export interface PayrollEntry {
  id: string;
  wallet: string;
  amount: number;
  token: Token;
  label?: string;
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
  label?: string;
  txSignature: string;
  timestamp: number;
}
