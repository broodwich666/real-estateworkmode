import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Zad Data Portal",
  description: "Multi-project data hub for structured records across Real Estate and other projects.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans text-ink antialiased`}>
        <div className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-6 sm:px-6">
          <Header />
          <main className="mt-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
