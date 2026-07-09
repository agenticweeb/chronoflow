/**
 * AI Provider Configuration & Auto-Failover Engine
 * 
 * Optimized Chain: Groq Direct → Google Direct → GitHub Mini → Backups
 * Direct keys are tried first for sub-2-second generation speeds.
 */

import { AIProvider } from "@/types";

// ── Provider Definitions ───────────────────────────────────
export const AI_PROVIDERS: AIProvider[] = [
  {
    name: "groq-direct",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile", // Upgraded to latest ultra-fast model
    apiKeyEnv: "GROQ_API_KEY",
    priority: 1, // Directly tried first! Sub-2s generation.
    headers: {},
  },
  {
    name: "google-gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    model: "gemini-1.5-flash",
    apiKeyEnv: "GOOGLE_AI_API_KEY",
    priority: 2, // Tried second. Extremely reliable direct endpoint.
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
      generationConfig: { temperature: 0.3, maxOutputTokens: 4000 },
    }),
  },
  {
    name: "github-gpt4o-mini",
    endpoint: "https://models.inference.ai.azure.com/chat/completions",
    model: "gpt-4o-mini", // Fast, low-latency mini model
    apiKeyEnv: "GITHUB_MODELS_TOKEN",
    priority: 3, // Tried third.
    headers: {
      "User-Agent": "ChronoFlow",
    },
  },
  {
    name: "github-gpt4o",
    endpoint: "https://models.inference.ai.azure.com/chat/completions",
    model: "gpt-4o",
    apiKeyEnv: "GITHUB_MODELS_TOKEN",
    priority: 4, // Tried fourth.
    headers: {
      "User-Agent": "ChronoFlow",
    },
  },
  {
    name: "openrouter-google",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
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

// ── Prompt Builder ─────────────────────────────────────────
export function buildWatchOrderPrompt(
  animeName: string,
  preferences: any
): string {
  return `You are ChronoFlow, an expert anime watch order curator with deep knowledge of anime production, narrative structure, and fan communities.

TASK: Generate a complete, structured watch order for "${animeName}".

USER PREFERENCES:
- Time budget: ${preferences.timeBudget}
- Mood: ${preferences.mood?.join(", ") || "all"}
- Skip preference: ${preferences.skipPreference}
- Include movies: ${preferences.includeMovies}
- Include OVAs: ${preferences.includeOVAs}
- Include specials: ${preferences.includeSpecials}
- Preferred path: ${preferences.preferredPath}

RULES:
1. Cover ALL entries: TV series, OVAs, movies, specials, ONAs, spin-offs
2. For each entry, classify into one of 4 tiers:
   - "essential": Cannot be skipped, core plot
   - "recommended": Enhances experience, character development
   - "optional": Nice to have, not critical
   - "skip": Filler, recap, or content that hurts pacing
3. For filler entries, classify type: "recap", "side-story", "character-intro", "world-building", "fanservice", "transition", "mixed"
4. Provide spoiler-free "whyWatch" for every entry
5. Provide "skipWarning" for skipped entries (what you miss)
6. Include time estimates in human-readable format
7. Suggest 2-3 alternative paths (release order, chronological, manga-follow)
8. If data is limited, set confidence < 70 and add warnings

OUTPUT FORMAT — Return ONLY valid JSON:
{
  "franchise": "string",
  "description": "string",
  "confidence": 0-100,
  "entries": [
    {
      "title": "string",
      "type": "TV|OVA|Movie|Special|ONA|Spin-off|Recap|Side-story",
      "tier": "essential|recommended|optional|skip",
      "position": 1,
      "episodeCount": number,
      "durationMinutes": number,
      "timeEstimate": "string",
      "prerequisites": ["title of prerequisite"],
      "isFiller": boolean,
      "fillerClassification": "none|recap|side-story|character-intro|world-building|fanservice|transition|mixed",
      "fillerReason": "string",
      "whyWatch": "string",
      "skipWarning": "string or null",
      "watchIf": ["string"],
      "contentTags": ["Action","Adventure","Comedy","Drama","Fantasy","Horror","Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller","Mecha","Isekai","Shounen","Seinen","Shoujo","Josei"],
      "arcName": "string or null"
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

Be thorough. Cover obscure OVAs and movies fans often miss. Distinguish between "skip because it's bad" vs "skip because it's recap you just watched".`;
}

// ── Auto-Failover Call ─────────────────────────────────────
export async function callAIWithFallback(
  prompt: string,
  maxRetries: number = 1 // Set to 1 so we skip to the next active key instantly on any failure
): Promise<{ content: string; provider: string; latency: number }> {
  const sortedProviders = [...AI_PROVIDERS].sort(
    (a, b) => a.priority - b.priority
  );

  for (const provider of sortedProviders) {
    const apiKey = process.env[provider.apiKeyEnv];
    if (!apiKey) {
      console.log(`⚠️  ${provider.name}: Key "${provider.apiKeyEnv}" is missing from environment, skipping...`);
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
              temperature: 0.3,
              max_tokens: 4000,
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
