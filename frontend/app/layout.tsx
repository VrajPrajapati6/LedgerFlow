import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { Shell } from "@/components/layout/Shell";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LedgerFlow — Financial Infrastructure Platform",
    template: "%s | LedgerFlow",
  },
  description:
    "Enterprise-grade internal financial infrastructure platform for banking operations, auditors, fraud analysts, and risk teams.",
  keywords: [
    "ledger",
    "financial infrastructure",
    "banking operations",
    "fraud detection",
    "reconciliation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased">
        <QueryProvider>
          <ErrorBoundary>
            <Shell>{children}</Shell>
          </ErrorBoundary>
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
