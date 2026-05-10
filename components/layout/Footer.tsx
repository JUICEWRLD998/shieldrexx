import Link from "next/link";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/audit", label: "Audit" },
  { href: "/contributor", label: "My Payments" },
] as const;

export function Footer() {
  return (
    <footer
      className="relative z-10 border-t mt-auto"
      style={{ borderColor: "rgba(124,58,237,0.15)", background: "rgba(6,9,26,0.6)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight">
            <span className="text-white">Shield</span>
            <span className="gradient-text">rexx</span>
          </span>
          <span
            className="h-3.5 w-px"
            style={{ background: "rgba(124,58,237,0.3)" }}
            aria-hidden="true"
          />
          <span className="text-slate-600 text-xs">Private payroll on Solana</span>
        </div>

        <nav className="flex items-center gap-5" aria-label="Footer navigation">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-slate-700 text-xs">
          Powered by{" "}
          <span style={{ color: "#a78bfa" }}>Cloak Protocol</span>
        </p>
      </div>
    </footer>
  );
}
