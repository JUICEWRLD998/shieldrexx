/**
 * Core Type Definitions — Single source of truth for all types
 *
 * This file centralizes all TypeScript types used throughout the application.
 * Import types from here instead of defining them in individual hooks or components.
 */

// ─────────────────────────────────────────────────────────────────────────
// Token & Currency
// ─────────────────────────────────────────────────────────────────────────

/** Supported cryptocurrency tokens */
export type Token = "USDC" | "USDT" | "SOL";

// ─────────────────────────────────────────────────────────────────────────
// Payroll & Batch Operations
// ─────────────────────────────────────────────────────────────────────────

/** Single entry in a payroll CSV/batch */
export interface PayrollEntry {
  id: string;
  wallet: string;
  amount: number;
  token: Token;
  status: "pending" | "sent" | "failed";
}

/** Status type for payroll entries */
export type PayrollStatus = PayrollEntry["status"];

/** Result of a successful batch disbursement */
export interface BatchResult {
  txSignature: string;
  timestamp: number;
  entries: PayrollEntry[];
  viewingKey: string;
}

/** Decrypted audit record from viewing key */
export interface AuditRecord {
  wallet: string;
  amount: number;
  token: Token;
  txSignature: string;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Viewing Key & Audit
// ─────────────────────────────────────────────────────────────────────────

/** Payload structure of a viewing key JSON */
export interface ViewingKeyPayload {
  batchEntries: Array<{
    wallet: string;
    amount: number;
    token: Token;
    txSignature: string;
  }>;
}

/** Imported batch with metadata */
export interface ImportedBatch {
  records: AuditRecord[];
  txSignature: string;
  timestamp: number;
  recipientCount: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Contributor Payments
// ─────────────────────────────────────────────────────────────────────────

/** Payment received by a contributor */
export interface ContributorPayment {
  amount: number;
  token: string;
  txSignature: string;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Transaction & Status
// ─────────────────────────────────────────────────────────────────────────

/** Transaction phase during batch send */
export type TransactionPhase = "idle" | "depositing" | "withdrawing" | "done" | "failed";

/** Status for UI operations */
export type OperationStatus = "idle" | "loading" | "success" | "error";

/** Generic async operation state */
export interface AsyncState<T> {
  status: OperationStatus;
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// Page & Component State
// ─────────────────────────────────────────────────────────────────────────

/** Step in multi-step workflows */
export type StepName = "Upload CSV" | "Review & Send" | "Confirmation";

/** Current page state for dashboard */
export type DashboardStep = 0 | 1 | 2;

/** Import/scan status for viewing keys and contributor payments */
export type ImportStatus = "idle" | "success" | "error";

export type ScanStatus = "idle" | "signing" | "scanning" | "done" | "error";

// ─────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────

/** Toast notification type */
export type ToastType = "success" | "error" | "warning" | "info";

/** Toast notification payload */
export interface Toast {
  id?: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

/** Badge variant styles */
export type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "pending";

/** Status indicator configuration */
export interface StatusConfig {
  label: string;
  color: string;
  background?: string;
  border?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────────────────────────────────

/** Application theme */
export type Theme = "dark" | "light";

/** Theme context value */
export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// API / Data Transfer
// ─────────────────────────────────────────────────────────────────────────

/** CSV parse result */
export interface ParseResult {
  entries: PayrollEntry[];
  errors: string[];
}

/** Batch history entry for dashboard */
export interface BatchHistoryEntry {
  id: string;
  txSignature: string;
  recipientCount: number;
  totalAmount: number;
  totalToken: Token;
  timestamp: number;
  status: "success" | "pending" | "failed";
}

/** Transaction confirmation status from Solscan */
export interface TransactionStatus {
  signature: string;
  status: "pending" | "confirmed" | "finalized" | "failed";
  confirmations: number;
  slot: number;
  fee: number;
  timestamp: number;
}
