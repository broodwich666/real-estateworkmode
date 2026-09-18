import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "Rental Match CRM",
  description: "Match NYC rental clients to a local listings database.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1c3358",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>
        <div className="mx-auto min-h-screen max-w-5xl px-4 pb-28 pt-6 sm:px-6">
          <header className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">NYC rentals</p>
              <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">Rental Match</h1>
            </div>
            <p className="hidden max-w-xs text-right text-sm text-ink/60 sm:block">
              Enter client criteria, search your listings, save the best options.
            </p>
          </header>
          {children}
        </div>
        <Nav />
      </body>
    </html>
  );
}
