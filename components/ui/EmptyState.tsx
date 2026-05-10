"use client";

/**
 * EmptyState Component — Consistent empty state UI
 *
 * Shows when there's no data to display with icon, message, and optional CTA.
 */

import { ReactNode } from "react";
import { BRAND, BACKGROUND, RADIUS } from "@/lib/design";

interface EmptyStateProps {
  /** Icon to display */
  icon?: ReactNode;
  /** Main heading */
  title: string;
  /** Descriptive text */
  description?: string;
  /** Optional CTA button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show as card or inline */
  variant?: "card" | "inline";
  /** Loading state */
  isLoading?: boolean;
  /** Additional className */
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    container: "p-8",
    icon: "w-10 h-10",
    title: "text-lg",
    description: "text-sm",
  },
  md: {
    container: "p-12",
    icon: "w-14 h-14",
    title: "text-xl",
    description: "text-base",
  },
  lg: {
    container: "p-16",
    icon: "w-16 h-16",
    title: "text-2xl",
    description: "text-lg",
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = "md",
  variant = "card",
  isLoading = false,
  className,
}: EmptyStateProps) {
  const config = SIZE_CONFIG[size];

  const content = (
    <div className="flex flex-col items-center justify-center text-center gap-4">
      {/* Icon */}
      {icon ? (
        <div
          className={`${config.icon} rounded-xl flex items-center justify-center shrink-0`}
          style={{
            background: `${BRAND.glow}`,
            border: `1.5px dashed ${BRAND.lite}`,
            color: BRAND.lite,
          }}
          aria-hidden="true"
        >
          {isLoading ? (
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={`${BRAND.lite}50`} strokeWidth="2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke={BRAND.lite} strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            icon
          )}
        </div>
      ) : null}

      {/* Title */}
      <h3 className={`${config.title} font-bold text-white`}>{title}</h3>

      {/* Description */}
      {description && <p className={`${config.description} text-slate-400 max-w-xs leading-relaxed`}>{description}</p>}

      {/* Action button */}
      {action && !isLoading && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
          style={{
            background: `linear-gradient(135deg, ${BRAND.mid}, ${BRAND.primary})`,
            color: "white",
            boxShadow: `0 0 28px ${BRAND.glow}`,
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );

  if (variant === "inline") {
    return (
      <div
        className={`${config.container} flex flex-col items-center justify-center ${className || ""}`}
        role="status"
        aria-label={title}
      >
        {content}
      </div>
    );
  }

  // Card variant
  return (
    <div
      className={`${config.container} rounded-2xl flex flex-col items-center justify-center ${className || ""}`}
      style={{
        background: BACKGROUND.surface,
        border: `1px solid ${BACKGROUND.dim}`,
        minHeight: "200px",
      }}
      role="status"
      aria-label={title}
    >
      {content}
    </div>
  );
}

export default EmptyState;
