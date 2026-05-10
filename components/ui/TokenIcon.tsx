"use client";

/**
 * TokenIcon Component — Token badge with symbol and color
 *
 * Displays a colored badge with the token symbol.
 */

import { TOKEN_COLOR, getTokenColor, getTokenBackground } from "@/lib/design";
import type { Token } from "@/types";

interface TokenIconProps {
  /** Token symbol */
  token: Token | string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show as a circle badge vs pill */
  variant?: "circle" | "pill";
  /** Show label text (only for pill) */
  showLabel?: boolean;
}

const SIZE_CONFIG = {
  sm: { container: "w-8 h-8", text: "text-xs" },
  md: { container: "w-10 h-10", text: "text-sm" },
  lg: { container: "w-12 h-12", text: "text-base" },
};

export function TokenIcon({
  token,
  size = "md",
  variant = "circle",
  showLabel = true,
}: TokenIconProps) {
  const config = SIZE_CONFIG[size];
  const color = getTokenColor(token);
  const background = getTokenBackground(token);

  if (variant === "pill") {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background,
          border: `1px solid ${color}40`,
        }}
      >
        <div
          className={`${config.container} rounded-lg flex items-center justify-center font-bold shrink-0`}
          style={{
            background: `${color}18`,
            border: `1px solid ${color}40`,
            color,
          }}
        >
          <span className={`${config.text}`}>{token.slice(0, 1)}</span>
        </div>
        {showLabel && <span className="text-sm font-semibold" style={{ color }}>
          {token}
        </span>}
      </div>
    );
  }

  // Circle variant (default)
  return (
    <div
      className={`${config.container} rounded-lg flex items-center justify-center font-bold shrink-0 flex-col justify-center items-center`}
      style={{
        background,
        border: `1px solid ${color}40`,
        color,
      }}
      title={token}
    >
      <span className={`${config.text} leading-none`}>{token.slice(0, 1)}</span>
    </div>
  );
}

export default TokenIcon;
