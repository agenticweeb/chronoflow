/**
 * AI Provider Configuration & Auto-Failover Engine
 * 
 * Optimized Chain: Groq Direct → Google Direct → GitHub Mini → Backups
 */

import { AIProvider } from "@/types";

// ── Provider Definitions ───────────────────────────────────
export const AI_PROVIDERS: AIProvider[] = [
  {
    name: "groq-direct",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile", 
    apiKeyEnv: "GROQ_API_KEY",
    priority: 1, 
    headers: {},
  },
  {
    name: "google-gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    model: "gemini-1.5-flash",
    apiKeyEnv: "GOOGLE_AI_API_KEY",
    priority: 2, 
    headers: {},
    bodyModifier: (body: any) => ({
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                body.messages?.[0]?.content ||
                body.messages?.[0],
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8000 },
    }),
  },
  {
    name: "github-gpt4o-mini",
    endpoint: "https://models.inference.ai.azure.com/chat/completions",
    model: "gpt-4o-mini", 
    apiKeyEnv: "GITHUB_MODELS_TOKEN",
    priority: 3, 
    headers: {
      "User-Agent": "ChronoFlow",
    },
  },
  {
    name: "github-gpt4o",
    endpoint: "https://models.inference.ai.azure.com/chat/completions",
    model: "gpt-4o",
    apiKeyEnv: "GITHUB_MODELS_TOKEN",
    priority: 4, 
    headers: {
      "User-Agent": "ChronoFlow",
    },
  },
  {
    name: "openrouter-google",
    endpoint: "https://openrouter.ai/api/openai/v1/chat/completions",
    model: "google/gemini-2.5-flash",
    apiKeyEnv: "OPENROUTER_API_KEY",
    priority: 5,
    headers: {
      "HTTP-Referer": "https://chronoflow.app",
      "X-Title": "ChronoFlow",
    },
  },
  {
    name: "openrouter-groq",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.1-70b-instruct",
    apiKeyEnv: "OPENROUTER_API_KEY",
    priority: 6,
    headers: {
      "HTTP-Referer": "https://chronoflow.app",
      "X-Title": "ChronoFlow",
    },
  },
  {
    name: "openrouter-cerebras",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: "cerebras/llama-3.1-70b",
    apiKeyEnv: "OPENROUTER_API_KEY",
    priority: 7,
    headers: {
      "HTTP-Referer": "https://chronoflow.app",
      "X-Title": "ChronoFlow",
    },
  },
  {
    name: "cerebras-direct",
    endpoint: "https://api.cerebras.ai/v1/chat/completions",
    model: "llama-3.1-70b",
    apiKeyEnv: "CEREBRAS_API_KEY",
    priority: 8,
    headers: {},
  },
];

// ── Verified Entry Shape (Fully declared to satisfy strict TS compilers) ──
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

// ── Prompt Builder (Optimized for Franchise Guides vs Arc-based guides) ──
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
  if (preferences?.skipPreference) {
    prefHints.push(`Skip preference: ${preferences.skipPreference}`);
  }
  if (preferences?.includeMovies === false) {
    prefHints.push("Exclude movies");
  }
  if (preferences?.includeOVAs === false) {
    prefHints.push("Exclude OVAs");
  }
  if (preferences?.includeSpecials === false) {
    prefHints.push("Exclude specials");
  }
  if (preferences?.mood && preferences.mood.length > 0 && !preferences.mood.includes("all")) {
    prefHints.push(`Mood tags: ${preferences.mood.join(", ")}`);
  }
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

// ── Auto-Failover Call ─────────────────────────────────────
export async function callAIWithFallback(
  prompt: string,
  maxRetries: number = 1
): Promise<{ content: string; provider: string; latency: number }> {
  const sortedProviders = [...AI_PROVIDERS].sort(
    (a, b) => a.priority - b.priority
  );

  for (const provider of sortedProviders) {
    const apiKey = process.env[provider.apiKeyEnv];
    if (!apiKey) {
      console.log(`⚠️  ${provider.name}: Key "${provider.apiKeyEnv}" missing, skipping...`);
      continue;
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const startTime = Date.now();
      try {
        const body = provider.bodyModifier
          ? provider.bodyModifier({
              messages: [{ role: "user", content: prompt }],
            })
          : {
              model: provider.model,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.1,
              max_tokens: 8000, 
            };

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...provider.headers,
        };

        if (provider.name === "google-gemini") {
          headers["x-goog-api-key"] = apiKey;
        } else {
          headers["Authorization"] = `Bearer ${apiKey}`;
        }

        const response = await fetch(provider.endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const latency = Date.now() - startTime;

        let content = "";
        if (provider.name === "google-gemini") {
          content =
            data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          content =
            data.choices?.[0]?.message?.content ||
            data.choices?.[0]?.text ||
            "";
        }

        if (!content) {
          throw new Error("Empty response from provider");
        }

        console.log(`✅ ${provider.name} responded in ${latency}ms`);
        return { content, provider: provider.name, latency };
      } catch (error: any) {
        const latency = Date.now() - startTime;
        console.error(
          `❌ ${provider.name} (Attempt ${attempt + 1}/${maxRetries}) failed in ${latency}ms:`,
          error.message || error
        );

        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
  }

  throw new Error(
    "All AI providers exhausted. Please check your API keys in .env.local"
  );
}
