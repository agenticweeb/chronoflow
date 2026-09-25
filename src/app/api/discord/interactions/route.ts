import { NextResponse, after } from "next/server";
import nacl from "tweetnacl";
import { searchAnimeAction, generateWatchOrderAction } from "@/app/actions";
import { queryAniList } from "@/lib/anilist-client";
export const runtime = "nodejs";

interface DiscordInteraction {
  type: number;
  data?: {
    name: string;
    options?: Array<{ name: string; value: string }>;
  };
  id: string;
  token: string;
}

function verifyDiscordSignature(
  signature: string,
  timestamp: string,
  body: string,
  publicKey: string
): boolean {
  try {
    const sig = Buffer.from(signature, "hex");
    const msg = Buffer.from(timestamp + body);
    const pubKey = Buffer.from(publicKey, "hex");
    return nacl.sign.detached.verify(msg, sig, pubKey);
  } catch {
    return false;
  }
}

async function patchOriginal(interactionToken: string, payload: unknown): Promise<void> {
  const appId = process.env.DISCORD_APPLICATION_ID!;
  const botToken = process.env.DISCORD_BOT_TOKEN!;
  await fetch(
    `https://discord.com/api/v10/webhooks/${appId}/${interactionToken}/messages/@original`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${botToken}`,
      },
      body: JSON.stringify(payload),
    }
  );
}

// Community recommendations — sorted by upvotes (RATING_DESC = most endorsed first)
const RECOMMENDATIONS_QUERY = `
  query Recs($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { english romaji }
      coverImage { large }
      recommendations(perPage: 8, sort: RATING_DESC) {
        nodes {
          mediaRecommendation {
            id
            title { english romaji }
            coverImage { large }
            episodes
            averageScore
            format
            status
          }
        }
      }
    }
  }
`;

// Shared resolution: user text -> the right anime (filters unreleased sequels)
async function resolveAnime(
  animeName: string
): Promise<{ title: string; anilistId: number | undefined }> {
  try {
    const search = await searchAnimeAction(animeName);
    if (search.success && search.data.length > 0) {
      const released = search.data.filter(
        (r: any) => r.status !== "NOT_YET_RELEASED" && (r.episodes ?? 0) > 0
      );
      const pool = released.length > 0 ? released : search.data;
      const best = pool[0];
      console.log(`[discord-bot] resolved "${animeName}" -> "${best.title}" (${best.anilistId})`);
      return { title: best.title, anilistId: best.anilistId || undefined };
    }
  } catch {
    // fall through to raw name
  }
  return { title: animeName, anilistId: undefined };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature-ed25519") || "";
  const timestamp = request.headers.get("x-signature-timestamp") || "";
  const publicKey = process.env.DISCORD_PUBLIC_KEY!;

  if (!verifyDiscordSignature(signature, timestamp, rawBody, publicKey)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const interaction: DiscordInteraction = JSON.parse(rawBody);

  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // ── /watchorder ────────────────────────────────────────────────
  if (interaction.type === 2 && interaction.data?.name === "watchorder") {
    const animeName =
      interaction.data.options?.find((o) => o.name === "anime")?.value || "";

    if (!animeName) {
      return NextResponse.json({
        type: 4,
        data: { content: "Please provide an anime name! Usage: `/watchorder anime:Fate`" },
      });
    }

    after(async () => {
      try {
        const resolved = await resolveAnime(animeName);

        const result = await generateWatchOrderAction({
          animeName: resolved.title,
          anilistId: resolved.anilistId,
          scope: "franchise",
          preferences: {
            timeBudget: "regular",
            mood: ["all"],
            skipPreference: "smart-skip",
            includeMovies: true,
            includeOVAs: true,
            includeSpecials: true,
            includeRecaps: false,
            preferredPath: "optimal",
            language: "english",
          },
        });

        if (result.success && result.data && (result.data.dataV2.totalEpisodes || 0) > 0) {
          const r = result.data.dataV2;
          const essentialCount =
            r.allEntriesFlat?.filter((e: any) => e.tier === "essential").length || 0;
          const skipCount =
            r.allEntriesFlat?.filter((e: any) => e.tier === "skip").length || 0;
          const skippedEpisodes = r.allEntriesFlat
            ?.filter((e: any) => e.tier === "skip" || e.isFiller)
            .reduce((sum: number, e: any) => sum + (e.episodeCount || 0), 0);
          const savedHours = Math.round((skippedEpisodes * 24) / 60);

          const ogCover =
            (r as any).franchiseImage ||
            r.allEntriesFlat?.[0]?.imageUrl ||
            r.allEntriesFlat?.[0]?.coverImage?.large ||
            "";
          const ogCoverParam = ogCover ? `&cover=${encodeURIComponent(ogCover)}` : "";

          await patchOriginal(interaction.token, {
            embeds: [
              {
                title: `${r.franchise} Watch Order`,
                description:
                  r.summary?.slice(0, 400) || `Complete watch order for ${r.franchise}`,
                color: 0x6366f1,
                url: `https://aniwatchorder.cc/?q=${encodeURIComponent(r.franchise)}`,
                image: {
                  url: `https://aniwatchorder.cc/api/og?franchise=${encodeURIComponent(r.franchise)}&entries=${r.totalEntries}&hours=${Math.round(r.totalDurationMinutes / 60)}&tier=Essential${ogCoverParam}`,
                },
                fields: [
                  { name: "Episodes", value: `${r.totalEpisodes} total`, inline: true },
                  { name: "Runtime", value: r.totalDuration || "Unknown", inline: true },
                  { name: "Entries", value: `${r.totalEntries} titles`, inline: true },
                  { name: "Essential", value: `${essentialCount} entries`, inline: true },
                  { name: "Skippable", value: `${skipCount} entries`, inline: true },
                  ...(savedHours > 0
                    ? [{ name: "Time Saved", value: `${skippedEpisodes} eps / ${savedHours}h`, inline: true }]
                    : []),
                ],
                footer: {
                  text: `Powered by MyAniWatchOrder • ${result.data.provider} • ${result.data.latency}ms`,
                },
              },
            ],
          });
        } else {
          await patchOriginal(interaction.token, {
            content: `Couldn't generate a watch order for "${animeName}". Try visiting https://aniwatchorder.cc/?q=${encodeURIComponent(animeName)} to search manually.`,
          });
        }
      } catch {
        await patchOriginal(interaction.token, {
          content: `An error occurred while generating the watch order for "${animeName}". Try https://aniwatchorder.cc/?q=${encodeURIComponent(animeName)} instead.`,
        });
      }
    });

    return NextResponse.json({ type: 5 });
  }

  // ── /recommend ─────────────────────────────────────────────────
  if (interaction.type === 2 && interaction.data?.name === "recommend") {
    const animeName =
      interaction.data.options?.find((o) => o.name === "anime")?.value || "";

    if (!animeName) {
      return NextResponse.json({
        type: 4,
        data: { content: "Please provide an anime name! Usage: `/recommend anime:Steins;Gate`" },
      });
    }

    after(async () => {
      try {
        const resolved = await resolveAnime(animeName);

        if (!resolved.anilistId) {
          await patchOriginal(interaction.token, {
            content: `Couldn't find "${animeName}" on AniList. Double-check the spelling, or try https://aniwatchorder.cc/?q=${encodeURIComponent(animeName)}`,
          });
          return;
        }

        const data = await queryAniList(RECOMMENDATIONS_QUERY, { id: resolved.anilistId });
        const media = data?.Media;
        const sourceTitle =
          media?.title?.english || media?.title?.romaji || resolved.title;
        const sourceCover = media?.coverImage?.large || "";

        // Filter: valid entries only, exclude the source itself and unreleased titles
        const seenIds = new Set<number>([resolved.anilistId]);
        const recs: any[] = [];
        for (const node of media?.recommendations?.nodes || []) {
          const rec = node?.mediaRecommendation;
          if (!rec?.id || !rec?.title) continue;
          const recTitle = rec.title?.english || rec.title?.romaji;
          if (!recTitle || seenIds.has(rec.id)) continue;
          if (rec.status === "NOT_YET_RELEASED") continue;
          seenIds.add(rec.id);
          recs.push(rec);
          if (recs.length >= 3) break;
        }

        if (recs.length === 0) {
          await patchOriginal(interaction.token, {
            content: `The AniList community hasn't built up recommendations for **${sourceTitle}** yet. Try \`/watchorder anime:${sourceTitle}\` for its full watch order instead!`,
          });
          return;
        }

        await patchOriginal(interaction.token, {
          embeds: [
            {
              title: `Because you watched ${sourceTitle}...`,
              description: "What the AniList community suggests watching next:",
              color: 0x6366f1,
              url: `https://aniwatchorder.cc/?q=${encodeURIComponent(sourceTitle)}`,
              ...(sourceCover ? { thumbnail: { url: sourceCover } } : {}),
              fields: recs.map((rec) => {
                const recTitle = rec.title?.english || rec.title?.romaji || "Unknown";
                const score = rec.averageScore
                  ? `${(rec.averageScore / 10).toFixed(1)}★`
                  : "Unrated";
                const eps = rec.episodes ? `${rec.episodes} eps` : "? eps";
                const fmt = rec.format || "TV";
                return {
                  name: recTitle,
                  value: `${score} · ${fmt} · ${eps}\n[Get its watch order →](https://aniwatchorder.cc/?q=${encodeURIComponent(recTitle)})`,
                };
              }),
              footer: { text: "Community recommendations via AniList • MyAniWatchOrder" },
            },
          ],
        });
      } catch {
        await patchOriginal(interaction.token, {
          content: `Something went wrong fetching recommendations for "${animeName}". Try \`/watchorder\` instead!`,
        });
      }
    });

    return NextResponse.json({ type: 5 });
  }

  return NextResponse.json({ error: "Unknown interaction type" }, { status: 400 });
}
