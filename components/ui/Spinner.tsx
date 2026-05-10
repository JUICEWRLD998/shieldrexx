"use client";

/**
 * Spinner Component — Loading indicator in multiple sizes/styles
 *
 * Replaces the 3+ copy-pasted spinner implementations with one flexible component.
 */

interface SpinnerProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Color override (default: brand primary) */
  color?: string;
  /** Background color (for ring style) */
  bgColor?: string;
  /** Show inline label */
  label?: string;
  /** Spinner style variant */
  variant?: "ring" | "dots" | "pulse";
}

const SIZE_CONFIG = {
  sm: { width: 16, height: 16, strokeWidth: 2 },
  md: { width: 24, height: 24, strokeWidth: 2 },
  lg: { width: 32, height: 32, strokeWidth: 2.5 },
};

export function Spinner({
  size = "md",
  color = "#a78bfa",
  bgColor = "rgba(167, 139, 250, 0.2)",
  label,
  variant = "ring",
}: SpinnerProps) {
  const config = SIZE_CONFIG[size];

  if (variant === "pulse") {
    return (
      <div className="flex items-center gap-2">
        <div
          className="rounded-full animate-pulse"
          style={{
            width: config.width,
            height: config.height,
            background: color,
            opacity: 0.6,
          }}
        />
        {label && <span className="text-xs text-slate-400">{label}</span>}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-full animate-bounce"
            style={{
              width: 6,
              height: 6,
              background: color,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
        {label && <span className="text-xs text-slate-400 ml-1">{label}</span>}
      </div>
    );
  }

  // Ring variant (default)
  return (
    <div className="flex items-center gap-2">
      <svg
        className="animate-spin"
        width={config.width}
        height={config.height}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke={bgColor} strokeWidth={config.strokeWidth} />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      {label && <span className="text-xs text-slate-400">{label}</span>}
    </div>
  );
}

export default Spinner;
