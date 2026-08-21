import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SEO_FRANCHISES, getFranchiseBySlug } from "@/lib/seo/franchises";
import { generateIntelligentWatchOrder } from "@/lib/ai/orchestrator";
import FlowchartV2 from "@/components/FlowchartV2";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const revalidate = 3600; // Revalidate cache every hour
export const dynamicParams = true; // Allow on-demand generation for non-prerendered slugs

// ✅ FIX: Register the route in the build manifest by pre-rendering just ONE page.
// This prevents the 404 error without triggering AniList rate limits or Vercel timeouts.
export async function generateStaticParams() {
  return [{ slug: 'fate-series' }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const franchise = getFranchiseBySlug(slug);
  if (!franchise) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chronoflow-zeta.vercel.app";
  const canonicalUrl = `${siteUrl}/watch-order/${franchise.slug}`;

  return {
    title: franchise.h1,
    description: franchise.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: franchise.h1,
      description: franchise.description,
      url: canonicalUrl,
      type: "article",
    },
  };
}

export default async function WatchOrderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const franchise = getFranchiseBySlug(slug);
  if (!franchise) notFound();

  const defaultPrefs = {
    timeBudget: "regular",
    mood: ["all"],
    skipPreference: "smart-skip" as const,
    includeMovies: true,
    includeOVAs: true,
    includeSpecials: true,
    includeRecaps: false,
    preferredPath: "optimal" as const,
    language: "english" as const,
  };

  let result;
  try {
    const orchResult = await generateIntelligentWatchOrder({
      animeName: franchise.name,
      anilistId: franchise.anilistId,
      scope: "franchise",
      preferences: defaultPrefs,
    });
    result = orchResult.result;
  } catch (e) {
    console.error(`Failed to generate SEO page for ${franchise.name}:`, e);
    return (
      <main className="min-h-dvh relative flex flex-col">
        {/* Sticky Back Button */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-chrono-border/20">
          <div className="max-w-5xl mx-auto w-full px-4 py-3">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#a8a3b8] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to ChronoFlow
            </Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold mb-4">{franchise.h1}</h1>
          <p className="text-chrono-text-muted">We're currently calculating the optimal path for this franchise. Please check back shortly.</p>
        </div>
      </main>
    );
  }

  // AI Optimization (AIO): FAQ Schema for LLM ingestion
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is the correct order to watch ${franchise.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `ChronoFlow recommends using the ${result.paths[0]?.name || 'Optimal'} path to preserve story reveals and skip filler. The complete guide and timeline are provided above.`
        }
      },
      {
        "@type": "Question",
        "name": `How many episodes are in ${franchise.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `There are ${result.totalEpisodes} watchable episodes across ${result.totalEntries} entries in this franchise, taking approximately ${result.totalDuration} to complete.`
        }
      }
    ]
  };

  return (
    <main className="min-h-dvh relative flex flex-col">
      {/* Sticky Back Button */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-chrono-border/20">
        <div className="max-w-5xl mx-auto w-full px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#a8a3b8] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to ChronoFlow
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient mb-3">
            {franchise.h1}
          </h1>
          <p className="text-chrono-text-muted max-w-2xl mx-auto">
            {franchise.description} Generated by ChronoFlow's AI-powered relation graph engine.
          </p>
        </div>

        <ErrorBoundary>
          <FlowchartV2 data={result} timeBudget="regular" />
        </ErrorBoundary>
      </div>
    </main>
  );
}
