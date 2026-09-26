import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { queryAniList } from "@/lib/anilist-client";

export const runtime = "nodejs";

const CHANNEL_ID = "1552285051981402152";
const PINNED_MESSAGE_KEY = "airing:pinned_message_id";

const AIRING_QUERY = `
  query {
    Page(perPage: 12) {
      media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC, isAdult: false, format_in: [TV, TV_SHORT, ONA]) {
        id
        title { english romaji }
        coverImage { large }
        averageScore
        episodes
        format
        genres
        description(asHtml: false)
        nextAiringEpisode { airingAt episode timeUntilAiring }
      }
    }
  }
`;

function daysUntil(airingAt: number): string {
  const diff = airingAt * 1000 - Date.now();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d`;
  return `${hours}h`;
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN!;

  try {
    const data = await queryAniList(AIRING_QUERY, {});
    const airing = (data?.Page?.media || []).filter((m: any) => m?.nextAiringEpisode);

    if (airing.length === 0) {
      return NextResponse.json({ error: "No airing anime found" }, { status: 404 });
    }

    const now = new Date();
    const weekLabel = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    const fields = airing.slice(0, 10).map((m: any) => {
      const title = m.title?.english || m.title?.romaji || "Unknown";
      const score = m.averageScore ? `${(m.averageScore / 10).toFixed(1)}⭐` : "—";
      const nextEp = m.nextAiringEpisode;
      const countdown = daysUntil(nextEp.airingAt);
      const genres = (m.genres || []).slice(0, 2).join(", ");
      const desc = (m.description || "").replace(/<[^>]*>/g, "").slice(0, 120) + "...";
      return {
        name: `${title} — Ep ${nextEp.episode}`,
        value: `${score} · ${countdown} until next ep · ${genres}\n${desc}`,
      };
    });

    const embed = {
      title: `📺 Currently Airing — Week of ${weekLabel}`,
      description: `**${airing.length} shows airing right now.** Here are the top ${Math.min(10, airing.length)} by popularity.\n\n🎬 **For watch orders, visit [aniwatchorder.cc](https://aniwatchorder.cc)** — spoiler-safe paths, filler skipping, and real finish dates for any franchise.`,
      color: 0x6366f1,
      fields,
      footer: { text: "Updated weekly • pinned for the week • MyAniWatchOrder" },
      timestamp: new Date().toISOString(),
    };

    const oldMessageId = await redis.get<string>(PINNED_MESSAGE_KEY);
    if (oldMessageId) {
      await fetch(
        `https://discord.com/api/v10/channels/${CHANNEL_ID}/pins/${oldMessageId}`,
        { method: "DELETE", headers: { Authorization: `Bot ${botToken}` } }
      ).catch(() => {});
    }

    const postRes = await fetch(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${botToken}`,
        },
        body: JSON.stringify({ embeds: [embed] }),
      }
    );

    if (!postRes.ok) {
      return NextResponse.json({ error: "Discord post failed" }, { status: 502 });
    }

    const posted = await postRes.json();
    const messageId = posted?.id;

    if (messageId) {
      await fetch(
        `https://discord.com/api/v10/channels/${CHANNEL_ID}/pins/${messageId}`,
        { method: "PUT", headers: { Authorization: `Bot ${botToken}` } }
      ).catch(() => {});

      await redis.set(PINNED_MESSAGE_KEY, messageId);
    }

    return NextResponse.json({ success: true, shows: airing.length, pinned: !!messageId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Airing weekly failed" }, { status: 500 });
  }
}
