"use client";

/**
 * WalletAddress Component — Display wallet with truncation and copy button
 *
 * Shows truncated wallet address with optional copy-to-clipboard button.
 * Replaces 4+ copy-paste implementations of wallet truncation.
 */

import { truncateWallet, copyToClipboard } from "@/lib/utils";
import { useState } from "react";

interface WalletAddressProps {
  /** Full wallet address */
  address: string;
  /** Characters to show from start */
  startChars?: number;
  /** Characters to show from end */
  endChars?: number;
  /** Show copy button */
  copyable?: boolean;
  /** Use monospace font */
  monospace?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

const SIZE_CONFIG = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function WalletAddress({
  address,
  startChars = 6,
  endChars = 4,
  copyable = false,
  monospace = true,
  size = "md",
  className,
}: WalletAddressProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await copyToClipboard(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  const display = truncateWallet(address, startChars, endChars);
  const fontClass = monospace ? "font-mono" : "";

  if (copyable) {
    return (
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${fontClass} ${SIZE_CONFIG[size]} ${className || ""}`}
        style={{
          background: "rgba(109, 40, 217, 0.12)",
          border: "1px solid rgba(124, 58, 237, 0.25)",
          color: "#c4b5fd",
        }}
        title={`Click to copy: ${address}`}
        aria-label={`Copy wallet address ${display}`}
      >
        {display}
        <svg
          className="w-3 h-3 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          {copied ? (
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </>
          )}
        </svg>
      </button>
    );
  }

  return (
    <span
      className={`${fontClass} ${SIZE_CONFIG[size]} text-slate-300 ${className || ""}`}
      title={address}
    >
      {display}
    </span>
  );
}

export default WalletAddress;
