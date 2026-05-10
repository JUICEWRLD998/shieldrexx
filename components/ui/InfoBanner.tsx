"use client";

/**
 * InfoBanner Component — Informational, warning, success, or error banner
 *
 * Replaces inline alert divs with a consistent, reusable banner component.
 */

import { STATUS_COLOR, BRAND } from "@/lib/design";
import { ReactNode } from "react";
import type { ToastType } from "@/types";

interface InfoBannerProps {
  /** Banner type (info, success, warning, error) */
  type?: Extract<ToastType, "info" | "success" | "warning" | "error">;
  /** Main heading */
  title: string;
  /** Optional description text */
  description?: string | ReactNode;
  /** Icon to display (optional, uses default if not provided) */
  icon?: ReactNode;
  /** Call-to-action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Show close button */
  closeable?: boolean;
  /** On close handler */
  onClose?: () => void;
  /** Custom border color */
  borderColor?: string;
  /** Custom background color */
  backgroundColor?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Role for accessibility */
  role?: "alert" | "status" | "note";
  /** Additional className */
  className?: string;
}

const SIZE_CONFIG = {
  sm: { padding: "p-3", icon: "w-4 h-4", title: "text-sm", description: "text-xs" },
  md: { padding: "p-4", icon: "w-5 h-5", title: "text-base", description: "text-sm" },
  lg: { padding: "p-5", icon: "w-6 h-6", title: "text-lg", description: "text-base" },
};

export function InfoBanner({
  type = "info",
  title,
  description,
  icon,
  action,
  closeable = false,
  onClose,
  borderColor,
  backgroundColor,
  size = "md",
  role = "alert",
  className,
}: InfoBannerProps) {
  const config = SIZE_CONFIG[size];
  const statusConfig = STATUS_COLOR[type as keyof typeof STATUS_COLOR];

  const finalBorderColor = borderColor || statusConfig.border;
  const finalBgColor = backgroundColor || statusConfig.bg;
  const finalColor = statusConfig.color;

  // Default icons by type
  const defaultIcon = (
    <svg
      className={`${config.icon} shrink-0 mt-0.5`}
      viewBox="0 0 24 24"
      fill="none"
      stroke={finalColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "info" && (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </>
      )}
      {type === "success" && <path d="M5 13l4 4L19 7" />}
      {type === "warning" && (
        <>
          <path d="M12 2L2 20h20L12 2z" />
          <path d="M12 9v4M12 17h.01" />
        </>
      )}
      {type === "error" && (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01M8 8l8 8M16 8l-8 8" />
        </>
      )}
    </svg>
  );

  return (
    <div
      className={`${config.padding} rounded-lg border flex items-start gap-3 ${className || ""}`}
      style={{
        background: finalBgColor,
        borderColor: finalBorderColor,
      }}
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
    >
      {/* Icon */}
      <div style={{ color: finalColor }}>{icon || defaultIcon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`${config.title} font-semibold`} style={{ color: finalColor }}>
          {title}
        </h3>
        {description && (
          <div className={`${config.description} mt-1 leading-relaxed`} style={{ color: finalColor }}>
            {description}
          </div>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-80"
            style={{ color: finalColor }}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      {closeable && onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 hover:opacity-70 transition-opacity"
          aria-label="Close banner"
        >
          <svg
            className={`${config.icon}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke={finalColor}
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default InfoBanner;
