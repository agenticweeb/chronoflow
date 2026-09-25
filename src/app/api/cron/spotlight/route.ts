import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { queryAniList } from "@/lib/anilist-client";
import { callAIWithFallback } from "@/lib/ai-providers";

export const runtime = "nodejs";

const SPOTLIGHT_POOL: Array<{ anilistId: number; title: string; angle: string }> = [
  { anilistId: 21, title: "One Piece", angle: "the long-runner everyone asks about" },
  { anilistId: 20, title: "Naruto", angle: "the filler problem, solved" },
  { anilistId: 269, title: "Bleach", angle: "the TYBW comeback story" },
  { anilistId: 10087, title: "Fate Series", angle: "the multiverse entry-point question" },
  { anilistId: 9253, title: "Steins;Gate", angle: "the time-loop masterpiece" },
  { anilistId: 16498, title: "Attack on Titan", angle: "the watch-order debate" },
  { anilistId: 14719, title: "JoJo's Bizarre Adventure", angle: "the generational saga" },
  { anilistId: 223, title: "Dragon Ball", angle: "the decades-spanning OG" },
  { anilistId: 918, title: "Gintama", angle: "the 'it gets good at episode 58' legend" },
  { anilistId: 6702, title: "Fairy Tail", angle: "the comfort-watch guild" },
  { anilistId: 1, title: "Cowboy Bebop", angle: "the perfect gateway" },
  { anilistId: 30, title: "Neon Genesis Evangelion", angle: "the ending discourse" },
  { anilistId: 9794, title: "Vinland Saga", angle: "the revenge-to-peace arc" },
  { anilistId: 101922, title: "Demon Slayer", angle: "the animation spectacle" },
  { anilistId: 21087, title: "Hunter x Hunter", angle: "the chimera ant conversation" },
];

const RECENT_KEY = "spotlight:recent";
const LOOKBACK = 7;
const FAN_VOICE_PROMPT = `You are an anime fan posting in a Discord server, not a company account.
Write like you're texting a friend who just asked "what should I watch."

Hard rules:
- Zero spoilers past episode 1 of the first entry.
- No corporate phrases: never "check it out," "don't miss out," "click below."
- Mention one concrete, specific detail about the franchise (not "great characters" — the actual thing that makes it worth watching).
- If there's a skip-worthy filler arc, mention it like a friend warning you, not like a feature.
- 2-3 sentences maximum.`;

async function pickUnrepeated(): Promise<{ anilistId: number; title: string; angle: string }> {
  const recent = await redis.lrange(RECENT_KEY, 0, LOOKBACK - 1).catch(() => [] as string[]);
  const eligible = SPOTLIGHT_POOL.filter((p) => !recent.includes(String(p.anilistId)));
  const pool = eligible.length > 0 ? eligible : SPOTLIGHT_POOL;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  await redis.lpush(RECENT_KEY, String(chosen.anilistId)).catch(() => {});
  await redis.ltrim(RECENT_KEY, 0, LOOKBACK - 1).catch(() => {});
  return chosen;
}

async function fetchFranchiseArt(anilistId: number): Promise<string> {
  try {
    const data = await queryAniList(
      `query($id: Int) { Media(id: $id, type: ANIME) { coverImage { large } } }`,
      { id: anilistId }
    );
    return data?.Media?.coverImage?.large || "";
  } catch {
    return "";
  }
}

async function writeFanBlurb(title: string, angle: string): Promise<string> {
  const fallback = `${title} — ${angle}. Worth every minute, and the watch order matters more than you'd think.`;
  try {
    const res = await callAIWithFallback(
      `${FAN_VOICE_PROMPT}\n\nThe anime: ${title} (known for: ${angle}). Write the post now.`,
      1
    );
    return res.content?.trim()?.slice(0, 500) || fallback;
  } catch {
    return fallback;
  }
}

async function postToDiscord(payload: unknown): Promise<boolean> {
  const webhook = process.env.DISCORD_POST_WEBHOOK!;
  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pick = await pickUnrepeated();
    const [blurb, cover] = await Promise.all([
      writeFanBlurb(pick.title, pick.angle),
      fetchFranchiseArt(pick.anilistId),
    ]);

    const ogUrl = `https://aniwatchorder.cc/api/og?franchise=${encodeURIComponent(pick.title)}&entries=${encodeURIComponent("Full")}&hours=${encodeURIComponent("Order")}&tier=Spotlight${cover ? `&cover=${encodeURIComponent(cover)}` : ""}`;

    const ok = await postToDiscord({
      embeds: [
        {
          title: ` spotlight: ${pick.title}`,
          description: blurb,
          color: 0x6366f1,
          url: `https://aniwatchorder.cc/?q=${encodeURIComponent(pick.title)}`,
          image: { url: ogUrl },
          footer: { text: "Daily spotlight • MyAniWatchOrder" },
        },
      ],
    });

    if (!ok) {
      return NextResponse.json({ error: "Discord webhook failed" }, { status: 502 });
    }

    return NextResponse.json({ success: true, spotlight: pick.title });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Spotlight failed" }, { status: 500 });
  }
}
