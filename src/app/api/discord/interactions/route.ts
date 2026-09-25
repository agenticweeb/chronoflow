import { NextResponse, after } from "next/server";
import nacl from "tweetnacl";
import { searchAnimeAction, generateWatchOrderAction } from "@/app/actions";
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

// PATCH the deferred original message with the final content
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

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature-ed25519") || "";
  const timestamp = request.headers.get("x-signature-timestamp") || "";
  const publicKey = process.env.DISCORD_PUBLIC_KEY!;

  if (!verifyDiscordSignature(signature, timestamp, rawBody, publicKey)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const interaction: DiscordInteraction = JSON.parse(rawBody);

  // PING — Discord's endpoint verification handshake
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // APPLICATION_COMMAND — must answer within 3s or Discord shows
  // "The application did not respond". Generation takes 5-30s, so we
  // defer instantly (type 5 shows "Bot is thinking..."), run the real
  // work in after() (guaranteed post-response execution), then PATCH
  // the result into the original message.
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
        // RESOLUTION STEP: match the user's text to the right anime BEFORE
        // generating — same discipline as the site's search flow. Without
        // this, "Cyberpunk" fuzzy-matched to the unreleased 2026 sequel
        // (0 episodes, 1 entry, broken embed).
        let resolvedAnimeName = animeName;
        let resolvedAnilistId: number | undefined;
        try {
          const search = await searchAnimeAction(animeName);
          if (search.success && search.data.length > 0) {
            const released = search.data.filter(
              (r: any) => r.status !== "NOT_YET_RELEASED" && (r.episodes ?? 0) > 0
            );
            const pool = released.length > 0 ? released : search.data;
            const best = pool[0]; // AniList's SEARCH_MATCH ordering is already relevance-ranked
            resolvedAnimeName = best.title;
            resolvedAnilistId = best.anilistId || undefined;
            console.log(`[discord-bot] resolved "${animeName}" → "${best.title}" (${best.anilistId})`);
          }
        } catch {
          // Resolution failure falls through to the raw name — generation
          // will use its internal search as before
        }

        const result = await generateWatchOrderAction({
          animeName: resolvedAnimeName,
          anilistId: resolvedAnilistId,
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

          await patchOriginal(interaction.token, {
            embeds: [
              {
                title: `${r.franchise} Watch Order`,
                description:
                  r.summary?.slice(0, 400) || `Complete watch order for ${r.franchise}`,
                color: 0x6366f1,
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
                // Dynamic OG image — the branded card, served by the existing
                // /api/og route. Discord renders embed images from URLs.
              url: `https://aniwatchorder.cc/?q=${encodeURIComponent(r.franchise)}`,
              image: {
                url: `https://aniwatchorder.cc/api/og?franchise=${encodeURIComponent(r.franchise)}&entries=${r.totalEntries}&hours=${Math.round(r.totalDurationMinutes / 60)}&tier=Essential`,
              },
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

    // Instant response: "Bot is thinking..."
    return NextResponse.json({ type: 5 });
  }

  return NextResponse.json({ error: "Unknown interaction type" }, { status: 400 });
}
