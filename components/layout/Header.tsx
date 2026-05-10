"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ConnectButton } from "@/components/ui/ConnectButton";

type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "shieldrexx_theme_mode";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/contributor", label: "My Payments" },
  { href: "/audit", label: "Audit" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: "var(--header-border)",
        background: "var(--header-bg)",
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
            <span style={{ color: "var(--header-logo)" }}>Shield</span>
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
                className={`header-nav-link px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${active ? "header-nav-link-active border" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            style={{ background: "var(--header-control-bg)", border: "1px solid var(--header-control-border)" }}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                <path d="M12 5V3M12 21v-2M5 12H3m18 0h-2M6.34 6.34 4.93 4.93m14.14 14.14-1.41-1.41M6.34 17.66l-1.41 1.41m14.14-14.14-1.41 1.41" stroke="var(--header-control-icon)" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="4" stroke="var(--header-control-icon)" strokeWidth="1.8"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z" stroke="var(--header-control-icon)" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Wallet button */}
          <ConnectButton />

          {/* Hamburger — mobile only */}
          <button
            className="sm:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-1.5 transition-colors"
            style={{ background: "var(--header-control-bg)", border: "1px solid var(--header-control-border)" }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <motion.span
              className="block w-4.5 h-px rounded-full"
              style={{ background: "var(--header-control-icon)", width: "18px" }}
              animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block h-px rounded-full"
              style={{ background: "var(--header-control-icon)", width: "18px" }}
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.15 }}
            />
            <motion.span
              className="block h-px rounded-full"
              style={{ background: "var(--header-control-icon)", width: "18px" }}
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
            style={{ borderColor: "var(--header-border)", background: "var(--mobile-nav-bg)" }}
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
                        ? { color: "var(--header-nav-active-text)", background: "var(--header-nav-active-bg)" }
                        : { color: "var(--header-nav-text)" }
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

