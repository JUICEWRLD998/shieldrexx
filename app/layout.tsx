import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaProviders } from "@/components/providers/SolanaProviders";
import { Header } from "@/components/layout/Header";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <SolanaProviders>
          <Header />
          <main className="flex flex-col flex-1">{children}</main>
        </SolanaProviders>
      </body>
    </html>
  );
}
