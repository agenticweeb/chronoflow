import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ChronoFlow — Anime Journeys, Optimized",
    template: "%s · ChronoFlow",
  },
  description:
    "Spoiler-safe anime watch orders grounded in AniList relation graphs. Smart skip, real finish dates, franchise paths that actually make sense.",
  applicationName: "ChronoFlow",
  authors: [{ name: "agenticweeb", url: "https://x.com/agenticweeb" }],
  keywords: [
    "anime watch order",
    "Fate watch order",
    "Monogatari order",
    "filler skip guide",
    "ChronoFlow",
  ],
  openGraph: {
    type: "website",
    title: "ChronoFlow — Never Watch Anime Wrong Again",
    description:
      "Grounded watch-order engine: relation graphs, shape classification, smart skip, calendar-ready schedules.",
    siteName: "ChronoFlow",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@agenticweeb",
    title: "ChronoFlow — Anime Journeys, Optimized",
    description:
      "Spoiler-safe paths, smart skip, and finish dates for any franchise.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030306" },
    { media: "(prefers-color-scheme: light)", color: "#030306" },
  ],
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased`}>
      <body className="bg-background text-foreground min-h-dvh relative overflow-x-hidden font-sans selection:bg-chrono-primary/30 selection:text-white">
        <div
          className="fixed inset-0 kinetic-grid pointer-events-none z-0"
          aria-hidden="true"
        />
        <div
          className="fixed top-[-15%] left-[-10%] w-[55vw] h-[55vw] max-w-[640px] rounded-full bg-chrono-primary/10 blur-[120px] pointer-events-none z-0"
          aria-hidden="true"
        />
        <div
          className="fixed bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] max-w-[560px] rounded-full bg-chrono-accent/5 blur-[110px] pointer-events-none z-0"
          aria-hidden="true"
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
