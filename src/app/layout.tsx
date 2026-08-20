import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ChronoFlow — Anime Watch Order Engine",
    template: "%s · ChronoFlow",
  },
  description:
    "Generate AI-powered, spoiler-safe anime watch orders for any franchise. Skip filler, calculate exact finish dates, and map complex timelines like Fate, Monogatari, and Gundam in seconds.",
  applicationName: "ChronoFlow",
  authors: [{ name: "agenticweeb", url: "https://x.com/agenticweeb" }],
  keywords: [
    "anime watch order",
    "Fate watch order",
    "Monogatari order",
    "filler skip guide",
    "anime timeline",
    "ChronoFlow",
  ],
  openGraph: {
    type: "website",
    title: "ChronoFlow — Never Watch Anime In The Wrong Order Again",
    description:
      "The ultimate grounded watch-order engine. AI-powered pathfinding, relation graph mapping, and smart skip for any anime franchise.",
    siteName: "ChronoFlow",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@agenticweeb",
    title: "ChronoFlow — Anime Watch Order Engine",
    description:
      "Spoiler-safe paths, smart skip, and real finish dates for any franchise.",
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
        <div className="relative z-10">
          <NuqsAdapter>
            <Providers>{children}</Providers>
          </NuqsAdapter>
        </div>
      </body>
    </html>
  );
}
