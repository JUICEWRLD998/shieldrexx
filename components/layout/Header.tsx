"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@/components/ui/ConnectButton";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contributor", label: "My Payments" },
  { href: "/audit", label: "Audit" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: "rgba(124,58,237,0.2)",
        background: "rgba(6,9,26,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base tracking-tight"
          aria-label="Shieldrexx home"
        >
          <span>
            <span className="text-white">Shield</span>
            <span className="gradient-text">rexx</span>
          </span>
        </Link>

        {/* Nav */}
        <nav
          className="hidden sm:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? "text-violet-300 border border-violet-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                style={
                  active
                    ? { background: "rgba(109,40,217,0.18)" }
                    : undefined
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet button */}
        <ConnectButton />
      </div>
    </header>
  );
}
