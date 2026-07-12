import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChronoFlow — Never Watch Anime Wrong Again",
  description:
    "Spoiler-safe anime watch orders. Smart skip, real finish dates, franchise paths that actually make sense.",
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
