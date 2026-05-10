/**
 * Utility Functions — Shared functions used across the app
 *
 * This module consolidates common utility functions that would otherwise
 * be duplicated in multiple components: formatting, truncation, export, etc.
 */

// ─────────────────────────────────────────────────────────────────────────
// String Truncation
// ─────────────────────────────────────────────────────────────────────────

/**
 * Truncate a wallet address to a readable format
 * @param wallet - Full wallet address (base58)
 * @param startChars - Number of characters to show from start (default: 6)
 * @param endChars - Number of characters to show from end (default: 4)
 * @returns Truncated format: "addr...xxxx"
 */
export function truncateWallet(wallet: string, startChars = 6, endChars = 4): string {
  if (!wallet || wallet.length <= startChars + endChars) return wallet;
  return `${wallet.slice(0, startChars)}…${wallet.slice(-endChars)}`;
}

/**
 * Truncate a transaction signature
 * @param sig - Full transaction signature
 * @param startChars - Number of characters from start (default: 8)
 * @param endChars - Number of characters from end (default: 6)
 * @returns Truncated format: "sig...xxxxxx"
 */
export function truncateTxSig(sig: string, startChars = 8, endChars = 6): string {
  if (!sig || sig.length <= startChars + endChars) return sig;
  return `${sig.slice(0, startChars)}…${sig.slice(-endChars)}`;
}

// ─────────────────────────────────────────────────────────────────────────
// Number Formatting
// ─────────────────────────────────────────────────────────────────────────

/**
 * Format a number with locale-aware thousand separators
 * @param num - Number to format
 * @param decimals - Maximum decimal places (default: 6)
 * @returns Formatted number string
 */
export function formatNumber(num: number, decimals = 6): string {
  if (typeof num !== "number" || isNaN(num)) return "0";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency amount with token symbol
 * @param amount - Numeric amount
 * @param token - Token symbol (USDC, USDT, SOL)
 * @param decimals - Maximum decimal places (default: 6)
 * @returns Formatted string: "1,234.56 USDC"
 */
export function formatCurrency(amount: number, token: string, decimals = 6): string {
  const formatted = formatNumber(amount, decimals);
  return `${formatted} ${token}`;
}

/**
 * Format SOL amount (accounts for lamports)
 * @param lamports - Amount in lamports
 * @returns Formatted SOL string
 */
export function formatSol(lamports: bigint | number): string {
  const sol = typeof lamports === "bigint" ? Number(lamports) / 1e9 : lamports / 1e9;
  return formatNumber(sol, 9);
}

// ─────────────────────────────────────────────────────────────────────────
// Date Formatting
// ─────────────────────────────────────────────────────────────────────────

/**
 * Format a timestamp to a readable date string
 * @param timestamp - Milliseconds since epoch
 * @param includeTime - Whether to include time (default: true)
 * @returns Formatted date string
 */
export function formatDate(timestamp: number, includeTime = true): string {
  const date = new Date(timestamp);
  if (includeTime) {
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a timestamp to time-only (HH:MM)
 * @param timestamp - Milliseconds since epoch
 * @returns Formatted time string
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param timestamp - Milliseconds since epoch
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp, false);
}

// ─────────────────────────────────────────────────────────────────────────
// File Export
// ─────────────────────────────────────────────────────────────────────────

interface CSVRow {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Export data to CSV file
 * @param data - Array of objects to export
 * @param filename - Output filename (without .csv extension)
 * @param headers - Optional custom headers mapping
 */
export function exportToCSV(
  data: CSVRow[],
  filename: string,
  headers?: Record<string, string>
): void {
  if (data.length === 0) {
    console.warn("exportToCSV: No data to export");
    return;
  }

  const keys = Object.keys(data[0]);
  const headerRow = headers ? keys.map((k) => headers[k] ?? k) : keys;

  const rows = data.map((row) =>
    keys.map((key) => {
      const value = row[key];
      if (value === null || value === undefined) return "";
      const stringVal = String(value);
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      if (stringVal.includes(",") || stringVal.includes("\n") || stringVal.includes('"')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    })
  );

  const csv = [headerRow.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as JSON file
 * @param data - Object to export
 * @param filename - Output filename (without .json extension)
 */
export function exportToJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────────────────

/**
 * Extract a human-readable error message
 * @param error - Any error object
 * @returns Clean error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const e = error as Record<string, unknown>;
    return String(e.message ?? "Unknown error");
  }
  return "An unknown error occurred";
}

/**
 * Format an error for display to users
 * @param error - Error object
 * @param fallback - Fallback message if parsing fails
 * @returns User-friendly error message (max 120 chars)
 */
export function formatErrorForUser(error: unknown, fallback = "Something went wrong"): string {
  const msg = getErrorMessage(error) || fallback;
  // Truncate to 120 chars and remove technical jargon
  return msg.length > 120 ? msg.slice(0, 117) + "…" : msg;
}

// ─────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────

/**
 * Check if a string is valid base58 (rough validation)
 * @param str - String to check
 * @returns True if string looks like valid base58
 */
export function isValidBase58(str: string): boolean {
  // Base58: no 0, O, I, l
  const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  return base58Regex.test(str) && str.length >= 32 && str.length <= 50;
}

/**
 * Check if a string is valid JSON
 * @param str - String to check
 * @returns True if string is valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Clipboard
// ─────────────────────────────────────────────────────────────────────────

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy succeeds
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard API not available");
  }
  await navigator.clipboard.writeText(text);
}

/**
 * Safely read from clipboard
 * @returns Promise resolving to clipboard text or null if unavailable
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard) return null;
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Array / Object Utilities
// ─────────────────────────────────────────────────────────────────────────

/**
 * Group array by a key function
 * @param array - Array to group
 * @param keyFn - Function that extracts the grouping key
 * @returns Object with keys mapping to arrays
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Sum numeric values from array
 * @param array - Array to sum
 * @param valueFn - Function that extracts the numeric value
 * @returns Sum total
 */
export function sum<T>(array: T[], valueFn: (item: T) => number): number {
  return array.reduce((acc, item) => acc + valueFn(item), 0);
}

// ─────────────────────────────────────────────────────────────────────────
// Misc
// ─────────────────────────────────────────────────────────────────────────

/**
 * Generate a unique ID (non-cryptographic)
 * @returns Unique string ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Debounce a function
 * @param fn - Function to debounce
 * @param delay - Milliseconds to delay
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
