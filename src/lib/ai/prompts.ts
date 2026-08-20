/**
 * ChronoFlow Intelligent Prompts V2.2 - Spec-Compliant & Hallucination-Proof
 */

import { AnimeShape, AllowedTitle, AIGenerationPayloadV2 } from "@/types/intelligent";

function formatAllowedTitles(allowed: AllowedTitle[]): string {
  return allowed.map(t => {
    const eps = t.episodes ? `${t.episodes} eps` : "? eps";
    const year = t.year ? ` ${t.year}` : "";
    const rel = t.relationType ? ` [${t.relationType}]` : "";
    const main = t.isMainEntry ? " [MAIN]" : "";
    return `- ID: ${t.id} | "${t.title}" | ${t.format} | ${eps}${year}${rel}${main}`;
  }).join("\n");
}

function formatPreferences(p: AIGenerationPayloadV2["userPreferences"]): string {
  const l: string[] = [];
  if (p.skipPreference) l.push(`Skip: ${p.skipPreference}`);
  if (p.includeMovies === false) l.push("Exclude movies");
  if (p.includeOVAs === false) l.push("Exclude OVAs");
  if (p.includeSpecials === false) l.push("Exclude specials");
  if (p.mood && p.mood.length && !p.mood.includes("all")) l.push(`Mood: ${p.mood.join(",")}`);
  return l.length ? l.join("\n") : "Default smart-skip";
}

const JSON_FOOTER = `
OUTPUT ONLY valid JSON. No markdown wrappers, no conversational text.
Schema:
{
  "franchise": "string",
  "classification": "mega_franchise|long_runner|canon_movie_sandwich|route_branching|remake_divergence|single_core",
  "classificationReason": "1 sentence",
  "summary": "2-3 sentences",
  "whyConfusing": "1 sentence",
  "recommendedPathId": "id",
  "confidence": 80,
  "paths": [
    {
      "id": "path_main",
      "name": "Main",
      "description": "...",
      "bestFor": ["First timers"],
      "difficulty": "beginner",
      "isSpoilerFree": true,
      "isRecommended": true,
      "groups": [
        {
          "id": "group_id",
          "name": "...",
          "description": "...",
          "timelineType": "main_timeline|alternate_timeline|spin_off|movie_collection|season_block|side_story",
          "orderNote": "...",
          "entries": [
            {
              "id": "ani_12345", // MUST EXACTLY MATCH AN ID FROM THE ALLOWED LIST ABOVE
              "tier": "essential|recommended|optional|skip",
              "tierReason": "why",
              "position": 1,
              "groupPosition": 1,
              "whyWatch": "rich 2-3 sentences, not generic",
              "skipWarning": "what missed or null",
              "watchIf": ["You like X"],
              "contentTags": ["Action"],
              "isFiller": false,
              "fillerType": "none|canon|mixed_canon_filler|pure_filler|recap|side_story",
              "fillerReason": "max 10 words",
              "arcName": "Arc name or null",
              "episodeRange": "1-25 or null",
              "watchAfter": "Watch after S1 ep11 or null",
              "prerequisites": []
            }
          ]
        }
      ],
      "warnings": []
    }
  ],
  "warnings": []
}

STRICT RULES:
1. Every "id" field in the entries array MUST be copied EXACTLY from the "Allowed Titles" list above. The format is "ani_" followed by a number (e.g., "ani_10087").
2. NEVER invent IDs or titles. If an entry is not in the Allowed Titles, you CANNOT include it.
3. NEVER include MANGA, NOVEL, LIGHT_NOVEL, ONE_SHOT, MANHWA, MANHUA. ONLY TV, MOVIE, OVA, ONA, SPECIAL, TV_SHORT.
4. If this is a SINGLE MOVIE (e.g., "Your Name"), return exactly ONE path with ONE group and ONE entry. Set classification to "single_core".
5. tierReason and whyWatch must be specific with characters/arcs, not generic.
`;

export function buildSingleCorePrompt(p: AIGenerationPayloadV2): string {
  const allowed = formatAllowedTitles(p.allowedTitles);
  const prefs = formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for SINGLE CORE or MOVIE "${p.franchiseName}".
This shape: 1-3 seasons linear, or a single standalone movie. No confusing timelines, just release order.
If it is a single movie, return exactly ONE entry. If it has 1 sequel/season, order them chronologically.
Allowed:
 ${allowed}
Prefs:
 ${prefs}
 ${JSON_FOOTER}`;
}

export function buildMegaFranchisePrompt(p: AIGenerationPayloadV2): string {
  const allowed = formatAllowedTitles(p.allowedTitles);
  const prefs = formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for MEGA FRANCHISE "${p.franchiseName}".
WHY CONFUSING: ${p.whyConfusing}
This shape: Main Timeline core, Alternate Timelines what-if, Spin Offs same universe standalone, Movies may be canon.
For Fate: Main = Fate/Zero -> Stay Night routes (Fate 2006 Saber route, UBW Rin route, Heavens Feel Sakura route). Spin offs = Prisma Illya (parallel), Apocrypha (alternate war), Grand Order, Lord El-Melloi (sequel to Zero, Waver), Extra, Carnival Phantasm (parody). Group correctly.
For Monogatari: Release order Bakemonogatari->Nisemonogatari->Second Season etc, not chronological, explain why.
Tiers: essential=core main timeline, recommended=good spin off like Lord El-Melloi, optional=parody like Carnival Phantasm, skip=recap.
Allowed Titles (ONLY these IDs):
 ${allowed}
Prefs:
 ${prefs}
Graph: ${p.verifiedGraphStats.totalNodes} nodes
Groups: ${p.groupsTemplate.map(g => `- ${g.groupId}: ${g.groupName} - ${g.instruction}`).join("\n")}
 ${JSON_FOOTER}`;
}

export function buildLongRunnerPrompt(p: AIGenerationPayloadV2): string {
  const allowed = formatAllowedTitles(p.allowedTitles);
  const prefs = formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for LONG RUNNER "${p.franchiseName}".
WHY CONFUSING: ${p.whyConfusing}
This shape: 100+ eps, filler disrupts pacing, need canon/mixed/filler classification.
Job: For each TV entry, provide innerOrder ranges like {"start":1,"end":26,"type":"canon","title":"Intro Arc"} etc. Mark pure_filler skip, mixed recommended, canon essential.
Allowed:
 ${allowed}
Prefs:
 ${prefs}
Groups: ${p.groupsTemplate.map(g => `- ${g.groupId}: ${g.groupName}`).join("\n")}
 ${JSON_FOOTER}`;
}

export function buildCanonMovieSandwichPrompt(p: AIGenerationPayloadV2): string {
  const allowed = formatAllowedTitles(p.allowedTitles);
  const prefs = formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for CANON MOVIE SANDWICH "${p.franchiseName}".
WHY CONFUSING: ${p.whyConfusing}
This shape: TV seasons and movies/OVAs interleave, movies are NOT optional, they continue main plot. Skipping breaks continuity.
CORRECT EXAMPLES:
- Demon Slayer: S1 ep1-26 -> Mugen Train movie (is ep27-33 canon, required) -> S2 -> Swordsmith
- Re:ZERO DEFINITIVE CORRECT ORDER (MEMORIZE THIS):
  1. S1 (25 eps) - Essential.
  2. Memory Snow OVA (60min) - Highly Recommended. Chronologically between S1 ep11 and ep12.
  3. Frozen Bond OVA (80min) - Essential. Prequel about Emilia, watch after S1.
  4. S2 Parts 1&2 (25 eps total) - Essential. Sanctuary Arc.
  NEVER include Chapter 1 Day in Capital or Chapter 2 Week at Mansion - those are MANGA.
Your job:
1. Identify canon vs non-canon movies/OVAs. Canon = essential, non-canon = optional.
2. For each canon movie/OVA, set watchAfter: "Watch after Season 1 Episode 11" etc.
Allowed Titles - ONLY THESE, NEVER MANGA:
 ${allowed}
Prefs:
 ${prefs}
Groups: ${p.groupsTemplate.map(g => `- ${g.groupId}: ${g.groupName}`).join("\n")}
 ${JSON_FOOTER}`;
}

export function buildRouteBranchingPrompt(p: AIGenerationPayloadV2): string {
  const allowed = formatAllowedTitles(p.allowedTitles);
  const prefs = formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for ROUTE BRANCHING "${p.franchiseName}".
WHY CONFUSING: ${p.whyConfusing}
This shape: Common route then diverges into parallel realities, NOT sequels. Watching Route B does NOT require Route A.
Example Fate/stay night: 2006 = Fate route, UBW = Rin route, Heavens Feel = Sakura route.
Job: Identify common, each divergent route, explain focus character/tone, tier essential for main routes.
Allowed:
 ${allowed}
Prefs:
 ${prefs}
Groups: ${p.groupsTemplate.map(g => `- ${g.groupId}: ${g.groupName} - ${g.instruction}`).join("\n")}
 ${JSON_FOOTER}`;
}

export function buildRemakeDivergencePrompt(p: AIGenerationPayloadV2): string {
  const allowed = formatAllowedTitles(p.allowedTitles);
  const prefs = formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for REMAKE DIVERGENCE "${p.franchiseName}".
WHY CONFUSING: ${p.whyConfusing}
This shape: Original and remake tell same story differently. Usually remake more faithful and recommended.
Example FMA vs FMAB: FMA 2003 diverges after ep30 original ending, FMAB 2009 100% manga faithful. Recommend FMAB essential, FMA optional.
Job: Compare versions, tier essential definitive, paths: Definitive (remake only), Completionist (both).
Allowed:
 ${allowed}
Prefs:
 ${prefs}
Groups: ${p.groupsTemplate.map(g => `- ${g.groupId}: ${g.groupName}`).join("\n")}
 ${JSON_FOOTER}`;
}

export function buildPromptForShape(shape: AnimeShape, payload: AIGenerationPayloadV2): string {
  switch (shape) {
    case "mega_franchise": return buildMegaFranchisePrompt(payload);
    case "long_runner": return buildLongRunnerPrompt(payload);
    case "canon_movie_sandwich": return buildCanonMovieSandwichPrompt(payload);
    case "route_branching": return buildRouteBranchingPrompt(payload);
    case "remake_divergence": return buildRemakeDivergencePrompt(payload);
    default: return buildSingleCorePrompt(payload);
  }
}

export function createGenerationPayload(params: {
  franchiseName: string;
  allowedTitles: AllowedTitle[];
  shape: AnimeShape;
  whyConfusing: string;
  userPreferences: AIGenerationPayloadV2["userPreferences"];
  groupsTemplate: Array<{ id: string; name: string; timelineType: any; description: string; allowedEntryIds?: string[]; instruction?: string }>;
  graphStats: { totalNodes: number; sources: string[] };
}): AIGenerationPayloadV2 {
  return {
    franchiseName: params.franchiseName,
    classification: params.shape,
    whyConfusing: params.whyConfusing,
    allowedTitles: params.allowedTitles,
    groupsTemplate: params.groupsTemplate.map(g => ({
      groupId: g.id,
      groupName: g.name,
      timelineType: g.timelineType,
      allowedEntryIds: g.allowedEntryIds || params.allowedTitles.map(t => t.id),
      instruction: g.instruction || g.description
    })),
    userPreferences: params.userPreferences,
    verifiedGraphStats: { totalNodes: params.graphStats.totalNodes, sources: params.graphStats.sources },
  };
}
