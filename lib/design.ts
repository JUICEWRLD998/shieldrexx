/**
 * Design System — Centralized design tokens and constants
 *
 * This file serves as the single source of truth for all design decisions:
 * colors, spacing, shadows, typography, and status/state styling.
 *
 * Importing from this module prevents color/style duplication and makes
 * global design changes trivial (edit here, change everywhere).
 */

// ─────────────────────────────────────────────────────────────────────────
// Color Palette
// ─────────────────────────────────────────────────────────────────────────

export const BRAND = {
  /** Primary brand color — purple */
  primary: "#7c3aed",
  /** Mid-tone brand — darker purple */
  mid: "#6d28d9",
  /** Lite tone — lighter purple for text/accents */
  lite: "#a78bfa",
  /** Pale tone — very light purple */
  pale: "#c4b5fd",
  /** Glow effect (rgba) */
  glow: "rgba(124, 58, 237, 0.35)",
};

export const BACKGROUND = {
  /** Deep dark background */
  deep: "#06091a",
  /** Surface color with transparency */
  surface: "rgba(13, 18, 48, 0.7)",
  /** Surface hover state */
  surfaceHover: "rgba(13, 18, 48, 0.85)",
  /** Subtle background for secondary elements */
  subtle: "rgba(13, 18, 48, 0.5)",
  /** Grid/border dim color */
  dim: "rgba(124, 58, 237, 0.18)",
  /** Grid border even dimmer */
  dimmer: "rgba(124, 58, 237, 0.1)",
};

export const NEUTRAL = {
  white: "#f1f5f9",
  slate50: "#f8fafc",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate700: "#334155",
};

// ─────────────────────────────────────────────────────────────────────────
// Token Colors (Cryptocurrency)
// ─────────────────────────────────────────────────────────────────────────

export const TOKEN_COLOR: Record<string, { light: string; dark: string; background: string; border: string }> = {
  USDC: {
    light: "#4ade80",
    dark: "#4ade80",
    background: "rgba(74, 222, 128, 0.12)",
    border: "rgba(74, 222, 128, 0.25)",
  },
  USDT: {
    light: "#34d399",
    dark: "#34d399",
    background: "rgba(52, 211, 153, 0.12)",
    border: "rgba(52, 211, 153, 0.25)",
  },
  SOL: {
    light: "#a78bfa",
    dark: "#a78bfa",
    background: "rgba(167, 139, 250, 0.12)",
    border: "rgba(167, 139, 250, 0.25)",
  },
};

export function getTokenColor(token: string): string {
  return TOKEN_COLOR[token]?.light || NEUTRAL.slate400;
}

export function getTokenBackground(token: string): string {
  return TOKEN_COLOR[token]?.background || "rgba(107, 114, 128, 0.12)";
}

export function getTokenBorder(token: string): string {
  return TOKEN_COLOR[token]?.border || "rgba(107, 114, 128, 0.25)";
}

// ─────────────────────────────────────────────────────────────────────────
// Status Colors & Labels
// ─────────────────────────────────────────────────────────────────────────

export const STATUS_COLOR: Record<
  "pending" | "sent" | "failed" | "success" | "warning" | "error" | "info",
  { bg: string; color: string; border: string; label: string }
> = {
  pending: {
    bg: "rgba(245, 158, 11, 0.12)",
    color: "#fbbf24",
    border: "rgba(245, 158, 11, 0.25)",
    label: "Pending",
  },
  sent: {
    bg: "rgba(34, 197, 94, 0.12)",
    color: "#4ade80",
    border: "rgba(34, 197, 94, 0.25)",
    label: "Sent",
  },
  failed: {
    bg: "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    border: "rgba(239, 68, 68, 0.25)",
    label: "Failed",
  },
  success: {
    bg: "rgba(34, 197, 94, 0.06)",
    color: "#4ade80",
    border: "rgba(34, 197, 94, 0.2)",
    label: "Success",
  },
  warning: {
    bg: "rgba(245, 158, 11, 0.08)",
    color: "#fbbf24",
    border: "rgba(245, 158, 11, 0.2)",
    label: "Warning",
  },
  error: {
    bg: "rgba(239, 68, 68, 0.08)",
    color: "#f87171",
    border: "rgba(239, 68, 68, 0.25)",
    label: "Error",
  },
  info: {
    bg: "rgba(124, 58, 237, 0.06)",
    color: "#a78bfa",
    border: "rgba(124, 58, 237, 0.2)",
    label: "Info",
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Transaction Phase Colors & Labels
// ─────────────────────────────────────────────────────────────────────────

export type TransactionPhase = "idle" | "depositing" | "withdrawing" | "done" | "failed";

export const PHASE_CONFIG: Record<TransactionPhase, { label: string; color: string; icon?: string }> = {
  idle: {
    label: "Waiting",
    color: "#4b5563",
  },
  depositing: {
    label: "Depositing…",
    color: "#fbbf24",
  },
  withdrawing: {
    label: "Withdrawing…",
    color: "#a78bfa",
  },
  done: {
    label: "Sent",
    color: "#4ade80",
  },
  failed: {
    label: "Failed",
    color: "#f87171",
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Spacing Scale (Tailwind-based)
// ─────────────────────────────────────────────────────────────────────────

export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "48px",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Border Radius
// ─────────────────────────────────────────────────────────────────────────

export const RADIUS = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  full: "9999px",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Shadows
// ─────────────────────────────────────────────────────────────────────────

export const SHADOW = {
  /** Subtle elevation */
  sm: "0 0 12px rgba(124, 58, 237, 0.08)",
  /** Standard elevation */
  md: "0 0 28px rgba(124, 58, 237, 0.1)",
  /** Strong elevation */
  lg: "0 0 48px rgba(124, 58, 237, 0.12)",
  /** Glow effect */
  glow: "0 0 28px rgba(124, 58, 237, 0.35)",
  /** Focus ring */
  focus: `0 0 0 3px rgba(124, 58, 237, 0.2)`,
  /** Inset subtle */
  insetSm: "inset 0 0 12px rgba(124, 58, 237, 0.05)",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────────────

export const TYPOGRAPHY = {
  /** Main sans-serif font */
  sans: "var(--font-geist-sans, system-ui, -apple-system, sans-serif)",
  /** Monospace font */
  mono: "var(--font-geist-mono, monospace)",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Button Styles
// ─────────────────────────────────────────────────────────────────────────

export const BUTTON_STYLE = {
  primary: {
    background: `linear-gradient(135deg, ${BRAND.mid}, ${BRAND.primary})`,
    color: NEUTRAL.white,
    boxShadow: `0 0 28px ${BRAND.glow}`,
    border: "none",
    hoverShadow: `0 0 52px ${BRAND.glow}`,
  },
  secondary: {
    background: "transparent",
    color: BRAND.lite,
    border: `1px solid rgba(124, 58, 237, 0.3)`,
    boxShadow: "none",
  },
  ghost: {
    background: "transparent",
    color: BRAND.lite,
    border: "none",
    boxShadow: "none",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Card Styles
// ─────────────────────────────────────────────────────────────────────────

export const CARD_STYLE = {
  background: BACKGROUND.surface,
  border: `1px solid ${BACKGROUND.dim}`,
  borderRadius: RADIUS.xl,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  transition: "border-color 0.25s, box-shadow 0.25s, transform 0.2s",
  hoverBorder: `1px solid rgba(124, 58, 237, 0.45)`,
  hoverShadow: `0 0 48px rgba(124, 58, 237, 0.1), inset 0 0 48px rgba(124, 58, 237, 0.03)`,
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Badge Styles
// ─────────────────────────────────────────────────────────────────────────

export const BADGE_STYLE = {
  borderRadius: RADIUS.full,
  padding: "6px 12px",
  fontSize: "0.75rem",
  fontWeight: "600",
  display: "inline-flex",
  alignItems: "center",
  gap: SPACING.xs,
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Animation Durations
// ─────────────────────────────────────────────────────────────────────────

export const ANIMATION = {
  fast: 150,
  base: 200,
  slow: 300,
  verySlow: 500,
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Z-Index Scale
// ─────────────────────────────────────────────────────────────────────────

export const Z_INDEX = {
  dropdown: 40,
  sticky: 20,
  fixed: 50,
  modal: 100,
  tooltip: 110,
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Breakpoints
// ─────────────────────────────────────────────────────────────────────────

export const BREAKPOINT = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;
