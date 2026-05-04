"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ConnectButton } from "@/components/ui/ConnectButton";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contributor", label: "My Payments" },
  { href: "/audit", label: "Audit" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: "rgba(124,58,237,0.2)",
        background: "rgba(6,9,26,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base tracking-tight shrink-0"
          aria-label="Shieldrexx home"
          onClick={() => setMenuOpen(false)}
        >
          <span>
            <span className="text-white">Shield</span>
            <span className="gradient-text">rexx</span>
          </span>
        </Link>

        {/* Desktop nav */}
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
                style={active ? { background: "rgba(109,40,217,0.18)" } : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Wallet button */}
          <ConnectButton />

          {/* Hamburger — mobile only */}
          <button
            className="sm:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-1.5 transition-colors"
            style={{ background: "rgba(109,40,217,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <motion.span
              className="block w-4.5 h-px rounded-full"
              style={{ background: "#a78bfa", width: "18px" }}
              animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block h-px rounded-full"
              style={{ background: "#a78bfa", width: "18px" }}
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.15 }}
            />
            <motion.span
              className="block h-px rounded-full"
              style={{ background: "#a78bfa", width: "18px" }}
              animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="sm:hidden overflow-hidden border-t"
            style={{ borderColor: "rgba(124,58,237,0.15)", background: "rgba(6,9,26,0.97)" }}
            aria-label="Mobile navigation"
          >
            <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={
                      active
                        ? { color: "#c4b5fd", background: "rgba(109,40,217,0.18)" }
                        : { color: "#94a3b8" }
                    }
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

