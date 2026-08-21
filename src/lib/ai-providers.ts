/**
 * AI Provider Configuration & Auto-Failover Engine (Vercel AI SDK)
 * 
 * MIGRATED: Replaced custom fetch logic with `generateText` from `ai` package.
 * This provides native provider fallback, standardized routing, and automatic retries.
 */

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AIProvider } from "@/types";

// ── Provider Definitions (Kept for backwards compat) ───────────────────────────────────
export const AI_PROVIDERS: AIProvider[] = [
  { name: "groq-direct", endpoint: "https://api.groq.com/openai/v1/chat/completions", model: "openai/gpt-oss-120b", apiKeyEnv: "GROQ_API_KEY", priority: 1, headers: {} },
  { name: "google-gemini", endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent", model: "gemini-1.5-flash-latest", apiKeyEnv: "GOOGLE_AI_API_KEY", priority: 2, headers: {} },
  { name: "openrouter-groq", endpoint: "https://openrouter.ai/api/v1/chat/completions", model: "meta-llama/llama-3.3-70b-instruct", apiKeyEnv: "OPENROUTER_API_KEY", priority: 3, headers: {} }
];

// ── Verified Entry Shape ──
export interface VerifiedEntry {
  anilistId: number;
  malId?: number;
  title: string;
  type?: string;          
  episodes?: number | null;
  duration?: number | null;      
  popularity?: number;
  format?: string | null;        
  description?: string | null;    
  trailer?: {                     
    id: string;
    site: string;
  } | null;
  imageUrl?: string | null;
  coverImage?: {
    large: string;
    medium: string;
  } | null;
  averageScore?: number | null;
  score?: number | null;
  genres?: string[];
  status?: string | null;
  titleJapanese?: string | null;
  relationType?: string | null;
}

// ── Prompt Builder (Legacy, used by /api/watch-order/route.ts if it exists) ──
export function buildWatchOrderPrompt(
  animeName: string,
  preferences: any,
  verifiedEntries: VerifiedEntry[],
  scope?: string
): string {
  const verifiedBlock =
    verifiedEntries.length > 0
      ? verifiedEntries
          .map((e) => {
            const id = e.anilistId ?? e.malId ?? "?";
            const type = e.type || e.format || "Unknown";
            const eps = e.episodes ?? "Unknown";
            const dur = e.duration ? `${e.duration}m` : "?";
            return `- ID: ${id} | "${e.title}" | ${type} | ${eps} eps | ${dur}`;
          })
          .join("\n")
      : "(No verified entries available.)";

  const prefHints: string[] = [];
  if (preferences?.skipPreference) prefHints.push(`Skip preference: ${preferences.skipPreference}`);
  if (preferences?.includeMovies === false) prefHints.push("Exclude movies");
  if (preferences?.includeOVAs === false) prefHints.push("Exclude OVAs");
  if (preferences?.includeSpecials === false) prefHints.push("Exclude specials");
  if (preferences?.mood && preferences.mood.length > 0 && !preferences.mood.includes("all")) prefHints.push(`Mood tags: ${preferences.mood.join(", ")}`);
  const prefBlock = prefHints.length > 0 ? prefHints.join("\n") : "(none)";

  const isFranchiseScope = scope === "franchise";

  return `You are ChronoFlow, an expert anime watch order curator with deep knowledge of narrative structures, story arcs, and filler lists.

TASK: Generate a curated watch order guide for "${animeName}".

The request scope is: [${(scope || "season").toUpperCase()}]

[OUTPUT FORMAT SELECTION]
 ${
  isFranchiseScope 
    ? `- CHOSEN CLASSIFICATION: TYPE A: FRANCHISE GUIDE (e.g. Fate Series, Monogatari, Gundam)
       * Output one entry per distinct show, season, or movie.
       * Keep descriptions to 1-3 highly descriptive sentences explaining what each entry is, where it fits, and why it is essential/recap/optional/filler.`
    : `- CHOSEN CLASSIFICATION: TYPE B: SINGLE SHOW GUIDE (e.g. Bleach, One Piece, Naruto, Fate/Zero)
       * Output an ARC-BASED skip guide for this specific show.
       * Each arc is ONE entry representing a folder block of episodes with an episode range like "21-63".
       * Mark filler arcs as tier "skip" with isFiller: true.
       * Mark canon arcs as tier "essential" or "recommended".
       * ALWAYS combine them into named arcs.`
}

[STRICT ARCHITECTURAL SAFETY RULES]
1. YOU CANNOT INVENT ANY ENTRIES. Every single item in your "entries" array MUST have an "id" matching an ID from the "Verified Database Entries" list below. If an ID is not in that list, you are strictly FORBIDDEN from including it.
2. DO NOT GUESS EPISODE COUNTS OR DURATIONS. The application backend will automatically overwrite these values with 100% verified database facts. Focus entirely on recommended viewing order.

Below is the VERIFIED LIST of anime entries fetched from the AniList database. These are real entries with real IDs. You MUST base your output on these entries. Do NOT invent titles or IDs.

 ${verifiedBlock}

User preferences:
 ${prefBlock}

OUTPUT FORMAT — Return ONLY valid JSON:
{
  "franchise": "string (the franchise name or main show name)",
  "description": "string (overview of how to watch, e.g. 'Linear shonen with ~50% filler. Skip marked arcs.')",
  "confidence": 0-100,
  "entries": [
    {
      "id": number (The EXACT database ID matching the verified input entries),
      "title": "string (The Arc name with episode range like 'Soul Society Arc (Eps 21-63)' or the Season Title)",
      "type": "TV" | "MOVIE" | "OVA" | "SPECIAL",
      "tier": "essential" | "recommended" | "optional" | "skip",
      "episodeRange": "X-Y" or null (The episode range of this specific arc if Type B, otherwise null),
      "position": 1,
      "prerequisites": [],
      "isFiller": boolean,
      "fillerClassification": "none|recap|side-story|character-intro|world-building|fanservice|transition|mixed",
      "fillerReason": "string (max 10 words)",
      "whyWatch": "string (highly descriptive context, why it matters, or character developments)",
      "skipWarning": "string or null (what you miss if skipped)",
      "watchIf": ["string"],
      "contentTags": ["Action","Adventure","Comedy","Drama","Fantasy","Sci-Fi","Shounen","Seinen","Supernatural"]
    }
  ],
  "paths": [
    {
      "name": "string",
      "description": "string",
      "entries": ["title1", "title2"],
      "totalTime": "string",
      "bestFor": ["string"]
    }
  ],
  "warnings": ["string or empty"]
}

Output the JSON now.`;
}
// ── Vercel AI SDK Auto-Failover Call ─────────────────────────────────────
export async function callAIWithFallback(
  prompt: string,
  maxRetries: number = 1
): Promise<{ content: string; provider: string; latency: number }> {
  const startTime = Date.now();

  // 1. Configure Providers explicitly
  const groq = createOpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
    name: "groq",
  });

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    name: "openrouter",
    headers: {
      "HTTP-Referer": "https://chronoflow.app",
      "X-Title": "ChronoFlow",
    },
  });

  const github = createOpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.GITHUB_MODELS_TOKEN,
    name: "github",
    headers: {
      "User-Agent": "ChronoFlow",
    },
  });

  // 2. Provider Chain (Groq -> Google -> OpenRouter -> GitHub)
  const providers = [
    { name: "groq", model: groq("openai/gpt-oss-120b"), apiKey: process.env.GROQ_API_KEY },
    // FIX: Updated to gemini-3.5-flash-lite as requested by Google's API
    { name: "google", model: google("gemini-3.5-flash-lite"), apiKey: process.env.GOOGLE_AI_API_KEY },
    // FIX: Restored OpenRouter (Free Llama 3.3 70B)
    { name: "openrouter", model: openrouter("meta-llama/llama-3.3-70b-instruct:free"), apiKey: process.env.OPENROUTER_API_KEY },
    // FIX: Restored GitHub (GPT-4o-mini)
    { name: "github", model: github("gpt-4o-mini"), apiKey: process.env.GITHUB_MODELS_TOKEN }
  ];

  console.log(`[AI] Prompt length: ${prompt.length} chars, ~${Math.ceil(prompt.length / 4)} tokens`);

  for (const p of providers) {
    if (!p.apiKey) {
      console.log(`⚠️ ${p.name}: Key missing, skipping...`);
      continue;
    }

    try {
      const { text, finishReason } = await generateText({
        model: p.model,
        prompt: prompt,
        maxOutputTokens: 4000,
        temperature: 0.1,
        // Lowered to 10s to prevent 30s hangs if a provider is unresponsive
        abortSignal: AbortSignal.timeout(10000) 
      });

      if (text && text.trim().length > 0 && finishReason !== "length") {
        const latency = Date.now() - startTime;
        console.log(`✅ AI SDK (${p.name}) responded in ${latency}ms`);
        return { content: text, provider: p.name, latency };
      } else {
        console.warn(`⚠️ ${p.name} returned empty or truncated text. Falling back...`);
      }
    } catch (error: any) {
      console.error(`❌ ${p.name} failed:`, error.message || error);
    }
  }

  const latency = Date.now() - startTime;
  console.error(`❌ All AI SDK providers exhausted in ${latency}ms`);
  throw new Error("All AI providers exhausted. Please check your API keys in .env.local");
}
