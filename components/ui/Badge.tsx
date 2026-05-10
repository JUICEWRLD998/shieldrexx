"use client";

/**
 * Badge Component — Flexible badge for tokens, status, and labels
 *
 * Displays a small, labeled badge with customizable styling.
 * Replaces 8+ inline badge implementations throughout the codebase.
 */

import { BADGE_STYLE, STATUS_COLOR, TOKEN_COLOR } from "@/lib/design";
import type { BadgeVariant } from "@/types";
import { ReactNode } from "react";

interface BadgeProps {
  /** Badge content/label */
  children: ReactNode;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Custom color (overrides variant) */
  color?: string;
  /** Custom background color */
  background?: string;
  /** Show as an icon badge */
  icon?: ReactNode;
  /** Pulse/glow effect */
  pulse?: boolean;
  /** Additional className */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function Badge({
  children,
  variant = "default",
  color,
  background,
  icon,
  pulse,
  className,
  style,
}: BadgeProps) {
  let badgeColor = color;
  let badgeBackground = background;

  if (!color || !background) {
    const config = STATUS_COLOR[variant as keyof typeof STATUS_COLOR];
    if (config) {
      badgeColor = color || config.color;
      badgeBackground = background || config.bg;
    } else if (TOKEN_COLOR[variant as keyof typeof TOKEN_COLOR]) {
      const tokenCfg = TOKEN_COLOR[variant];
      badgeColor = color || tokenCfg.light;
      badgeBackground = background || tokenCfg.background;
    } else {
      // Default styling
      badgeColor = color || "#a78bfa";
      badgeBackground = background || "rgba(167, 139, 250, 0.12)";
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${className || ""} ${
        pulse ? "animate-pulse" : ""
      }`}
      style={{
        ...BADGE_STYLE,
        color: badgeColor,
        background: badgeBackground,
        ...style,
      }}
      role="status"
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
