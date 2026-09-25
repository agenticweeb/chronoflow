import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { queryAniList } from "@/lib/anilist-client";
import { FranchisePassport } from "@/components/FranchisePassport";
import { GenerationHistorySection } from "@/components/account/GenerationHistorySection";
import { ConnectedAccountsSection } from "@/components/account/ConnectedAccountsSection";
import { SettingsSection } from "@/components/account/SettingsSection";
import { Clock, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const MEDIA_INFO_QUERY = `
  query($ids: [Int]) {
    Page(page: 1, perPage: 50) {
      media(id_in: $ids, type: ANIME) {
        id
        title { english romaji native }
        coverImage { large color }
        episodes
        format
      }
    }
  }
`;

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?signin=1");
  }

  // Read progress + generation history from Supabase
  const { data: profile } = await supabase
    .from("user_progress")
    .select("progress_data, updated_at, generation_history, settings")
    .eq("id", user.id)
    .single();
  const progressData = profile?.progress_data || {};

  // Parse franchise data from the progress map
  const franchises = Object.entries(progressData).map(([franchiseId, data]: [string, any]) => {
    const anilistId = parseInt(franchiseId.replace("fr_", ""), 10);
    const entries = Object.values(data.entries || {});
    const watchedEntries = entries.filter((e: any) => e.watched).length;
    const totalEntries = entries.length;
    const totalWatched = data.totalWatched || 0;
    const totalEpisodes = data.totalEpisodes || 0;

    return {
      franchiseId,
      anilistId,
      totalWatched,
      totalEpisodes,
      watchedEntries,
      totalEntries,
      lastUpdated: data.lastUpdated,
      startedAt: data.startedAt,
    };
  }).filter(f => !isNaN(f.anilistId) && f.anilistId > 0);

  // Batch-fetch media info from AniList
  const ids = franchises.map(f => f.anilistId);
  let mediaMap: Record<number, any> = {};

  if (ids.length > 0) {
    try {
      const data = await queryAniList(MEDIA_INFO_QUERY, { ids });
      const mediaList = data?.Page?.media || [];
      for (const m of mediaList) {
        mediaMap[m.id] = m;
      }
    } catch {
      // AniList might be down — render with placeholder data
    }
  }

  // Enrich franchises with media info
  const enrichedFranchises = franchises.map(f => ({
    ...f,
    title: mediaMap[f.anilistId]?.title?.english || mediaMap[f.anilistId]?.title?.romaji || `Anime #${f.anilistId}`,
    imageUrl: mediaMap[f.anilistId]?.coverImage?.large || "",
    coverColor: mediaMap[f.anilistId]?.coverImage?.color || "#6366f1",
  }));

  // Calculate summary stats
  const totalFranchises = enrichedFranchises.length;
  const completedFranchises = enrichedFranchises.filter(f => f.totalEpisodes > 0 && f.totalWatched >= f.totalEpisodes).length;
  const totalEpisodesWatched = enrichedFranchises.reduce((sum, f) => sum + f.totalWatched, 0);
  const totalHoursInvested = Math.round(totalEpisodesWatched * 24 / 60);

  return (
    <main className="min-h-dvh relative flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-chrono-border/20">
        <div className="max-w-5xl mx-auto w-full px-4 py-3">
          <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#a8a3b8] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <GenerationHistorySection history={profile?.generation_history ?? []} />

        <ConnectedAccountsSection />

        <SettingsSection initialSettings={profile?.settings ?? null} />

        <FranchisePassport
          franchises={enrichedFranchises}
          userEmail={user.email || ""}
          stats={{
            totalFranchises,
            completedFranchises,
            totalEpisodesWatched,
            totalHoursInvested,
          }}
        />
      </div>
    </main>
  );
}
