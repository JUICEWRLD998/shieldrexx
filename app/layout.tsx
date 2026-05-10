import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaProviders } from "@/components/providers/SolanaProviders";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shieldrexx — Private Payroll on Solana",
  description:
    "Zero-knowledge batch payroll disbursements. Private by default, auditable by choice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-zinc-50" suppressHydrationWarning style={{ backgroundColor: "var(--bg-deep)" }}>
        {/* Global background — grid + animated orbs on every page */}
        <div className="fixed inset-0 bg-grid pointer-events-none select-none z-0" aria-hidden="true" />
        <div
          className="orb fixed pointer-events-none z-0"
          style={{ top: "-180px", left: "12%", width: "720px", height: "720px", borderRadius: "50%", background: "radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 65%)" }}
          aria-hidden="true"
        />
        <div
          className="orb orb-2 fixed pointer-events-none z-0"
          style={{ bottom: "-80px", right: "5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 65%)" }}
          aria-hidden="true"
        />
        <SolanaProviders>
          <ToastProvider>
            <div className="relative z-10 flex flex-col min-h-full">
              <Header />
              <main className="flex flex-col flex-1">{children}</main>
              <Footer />
            </div>
          </ToastProvider>
        </SolanaProviders>
      </body>
    </html>
  );
}
