import Link from "next/link";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/audit", label: "Audit" },
  { href: "/contributor", label: "My Payments" },
] as const;

export function Footer() {
  return (
    <footer
      className="relative z-10 border-t mt-auto"
      style={{ borderColor: "var(--footer-border)", background: "var(--footer-bg)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight">
            <span style={{ color: "var(--header-logo)" }}>Shield</span>
            <span className="gradient-text">rexx</span>
          </span>
          <span
            className="h-3.5 w-px"
            style={{ background: "var(--footer-rule)" }}
            aria-hidden="true"
          />
          <span className="text-xs" style={{ color: "var(--footer-text)" }}>Private payroll on Solana</span>
        </div>

        <nav className="flex items-center gap-5" aria-label="Footer navigation">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="footer-link text-xs font-medium transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-xs" style={{ color: "var(--footer-text)" }}>
          Powered by{" "}
          <span style={{ color: "#a78bfa" }}>Cloak Protocol</span>
        </p>
      </div>
    </footer>
  );
}
