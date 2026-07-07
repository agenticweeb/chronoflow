import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChronoFlow — Your Anime Journey, Optimized",
  description:
    "Intelligent anime watch order generator. Any anime. Smart skip. Time-aware paths.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-chrono-bg text-chrono-text font-sans">
        {children}
      </body>
    </html>
  );
}
