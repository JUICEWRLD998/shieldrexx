/**
 * Toast Helper Functions — Common toast patterns
 *
 * Wraps the ToastProvider context with convenient helper functions for
 * displaying toasts with consistent formatting and handling common patterns
 * like async operations, batch operations, and error formatting.
 */

import { formatErrorForUser } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Toast Patterns
// ─────────────────────────────────────────────────────────────────────────

/**
 * Show a success toast
 */
export function showSuccess(title: string, message?: string, duration = 4000): ToastOptions {
  return { type: "success", title, message, duration };
}

/**
 * Show an error toast with automatic formatting
 */
export function showError(error: unknown, title = "Error", duration = 5000): ToastOptions {
  const message = formatErrorForUser(error);
  return { type: "error", title, message, duration };
}

/**
 * Show a warning toast
 */
export function showWarning(title: string, message?: string, duration = 4000): ToastOptions {
  return { type: "warning", title, message, duration };
}

/**
 * Show an info toast
 */
export function showInfo(title: string, message?: string, duration = 4000): ToastOptions {
  return { type: "info", title, message, duration };
}

// ─────────────────────────────────────────────────────────────────────────
// Async Operation Patterns
// ─────────────────────────────────────────────────────────────────────────

/**
 * Pattern for async operations: loading → success/error
 * 
 * Usage:
 * ```
 * await toastAsync(async () => {
 *   await someOperation();
 * }, {
 *   loading: "Uploading...",
 *   success: "Upload complete",
 *   error: "Upload failed",
 * });
 * ```
 */
export interface AsyncToastConfig {
  loading?: string;
  success?: string;
  error?: string;
  successDuration?: number;
  errorDuration?: number;
}

export async function toastAsync<T>(
  operation: () => Promise<T>,
  config: AsyncToastConfig
): Promise<T> {
  const { loading, success, error, successDuration = 4000, errorDuration = 5000 } = config;

  if (loading) {
    console.info(`[Toast] Loading: ${loading}`);
  }

  try {
    const result = await operation();
    if (success) {
      console.log(`[Toast] Success (${successDuration}ms): ${success}`);
    }
    return result;
  } catch (err: unknown) {
    if (error) {
      console.error(`[Toast] Error (${errorDuration}ms): ${error}`, err);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Batch Operation Patterns
// ─────────────────────────────────────────────────────────────────────────

export interface BatchOperation {
  id: string;
  name: string;
}

export interface BatchToastResult {
  succeeded: number;
  failed: number;
  total: number;
}

/**
 * Generate a summary toast for batch operations
 */
export function toastBatchSummary(result: BatchToastResult): ToastOptions {
  const { succeeded, failed, total } = result;
  if (failed === 0) {
    return showSuccess(
      `All ${total} items processed`,
      `${succeeded} successful`,
      4000
    );
  }
  if (succeeded === 0) {
    return showError(
      new Error(`All ${total} items failed`),
      `Batch operation failed`,
      6000
    );
  }
  return showWarning(
    `${succeeded} of ${total} items succeeded`,
    `${failed} item${failed !== 1 ? "s" : ""} failed`,
    5000
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Network / API Patterns
// ─────────────────────────────────────────────────────────────────────────

/**
 * Handle common fetch/API errors
 */
export function handleFetchError(response: Response): ToastOptions {
  switch (response.status) {
    case 400:
      return showError(new Error("Bad request"), "Invalid input", 4000);
    case 401:
      return showError(new Error("Unauthorized"), "Please connect your wallet", 4000);
    case 403:
      return showError(new Error("Forbidden"), "Access denied", 4000);
    case 404:
      return showError(new Error("Not found"), "Resource not found", 4000);
    case 429:
      return showWarning("Rate limited", "Please wait a moment and try again", 5000);
    case 500:
      return showError(new Error("Server error"), "Something went wrong on the server", 5000);
    case 502:
      return showError(new Error("Bad gateway"), "Network error", 5000);
    case 503:
      return showError(new Error("Service unavailable"), "Service is temporarily down", 5000);
    default:
      return showError(
        new Error(`HTTP ${response.status}`),
        "Network error occurred",
        5000
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Wallet / Blockchain Patterns
// ─────────────────────────────────────────────────────────────────────────

/**
 * Show wallet connection toast
 */
export function toastWalletConnected(address: string): ToastOptions {
  return showSuccess("Wallet connected", `${address.slice(0, 6)}…${address.slice(-4)}`);
}

/**
 * Show wallet disconnection toast
 */
export function toastWalletDisconnected(): ToastOptions {
  return showInfo("Wallet disconnected");
}

/**
 * Show transaction submitted toast with link hint
 */
export function toastTxSubmitted(txSignature?: string): ToastOptions {
  return showInfo(
    "Transaction submitted",
    txSignature ? `${txSignature.slice(0, 8)}…` : undefined
  );
}

/**
 * Show transaction confirmed toast
 */
export function toastTxConfirmed(txSignature?: string): ToastOptions {
  return showSuccess(
    "Transaction confirmed",
    txSignature ? `${txSignature.slice(0, 8)}…` : undefined
  );
}

/**
 * Show transaction failed toast
 */
export function toastTxFailed(error: unknown): ToastOptions {
  return showError(error, "Transaction failed", 6000);
}

// ─────────────────────────────────────────────────────────────────────────
// Validation Patterns
// ─────────────────────────────────────────────────────────────────────────

/**
 * Show validation error toast from form submission
 */
export function toastValidationError(errors: string[]): ToastOptions {
  const count = errors.length;
  return showError(
    new Error(errors[0]),
    `${count} validation error${count !== 1 ? "s" : ""}`,
    5000
  );
}

// ─────────────────────────────────────────────────────────────────────────
// UI Action Patterns
// ─────────────────────────────────────────────────────────────────────────

/**
 * Show copy-to-clipboard confirmation
 */
export function toastCopied(label = "Copied"): ToastOptions {
  return showSuccess(label);
}

/**
 * Show file export confirmation
 */
export function toastExported(filename: string): ToastOptions {
  return showSuccess("File exported", filename, 3000);
}

/**
 * Show item deleted confirmation
 */
export function toastDeleted(itemName: string): ToastOptions {
  return showInfo(`${itemName} deleted`, undefined, 3000);
}
