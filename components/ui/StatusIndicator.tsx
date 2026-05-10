"use client";

/**
 * StatusIndicator Component — Color-coded status with icon and label
 *
 * Combines color + icon for WCAG-compliant status display.
 * Replaces color-only status displays with accessible alternatives.
 */

import { PHASE_CONFIG, STATUS_COLOR } from "@/lib/design";
import { ReactNode } from "react";
import type { TransactionPhase } from "@/types";

interface StatusIndicatorProps {
  /** The status to display */
  status: TransactionPhase | keyof typeof STATUS_COLOR;
  /** Show the label text */
  showLabel?: boolean;
  /** Custom label (overrides default) */
  label?: string;
  /** Custom color (overrides default) */
  color?: string;
  /** Icon to display (defaults to based on status) */
  icon?: ReactNode;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show as a dot/pill instead of text */
  variant?: "text" | "pill" | "dot";
}

const SIZE_CONFIG = {
  sm: "w-3 h-3 text-xs",
  md: "w-4 h-4 text-sm",
  lg: "w-5 h-5 text-base",
};

export function StatusIndicator({
  status,
  showLabel = true,
  label,
  color,
  icon,
  size = "md",
  variant = "text",
}: StatusIndicatorProps) {
  // Determine config from phase or status
  let config = PHASE_CONFIG[status as TransactionPhase];
  if (!config) {
    config = STATUS_COLOR[status as keyof typeof STATUS_COLOR];
  }

  if (!config) {
    return null;
  }

  const displayColor = color || config.color;
  const displayLabel = label || config.label;
  const sizeClass = SIZE_CONFIG[size];

  // Default icons based on status
  const defaultIcon = (
    <svg className={`${sizeClass} shrink-0`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {status === "idle" && <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.5" />}
      {(status === "depositing" || status === "withdrawing") && (
        <circle cx="12" cy="12" r="10" fill="none" stroke={displayColor} strokeWidth="2" opacity="0.3" />
      )}
      {status === "done" && <path d="M5 13l4 4L19 7" strokeWidth="2.5" stroke={displayColor} fill="none" />}
      {status === "failed" && <path d="M7 7l10 10M17 7l-10 10" strokeWidth="2.5" stroke={displayColor} />}
    </svg>
  );

  if (variant === "dot") {
    return (
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: displayColor }}
        role="status"
        aria-label={displayLabel}
      />
    );
  }

  if (variant === "pill") {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
        style={{
          background: `${displayColor}20`,
          color: displayColor,
          border: `1px solid ${displayColor}40`,
        }}
        role="status"
      >
        {icon || defaultIcon}
        {showLabel && displayLabel}
      </span>
    );
  }

  // Text variant (default)
  return (
    <span className="inline-flex items-center gap-1.5" style={{ color: displayColor }} role="status">
      {icon || defaultIcon}
      {showLabel && <span className="text-sm font-medium">{displayLabel}</span>}
    </span>
  );
}

export default StatusIndicator;
