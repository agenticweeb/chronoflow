/**
 * ChronoFlow Intelligent Prompts V2.1 - Manga exclusion + Re:Zero correct example
 */

import { AnimeShape, AllowedTitle, AIGenerationPayloadV2 } from "@/types/intelligent";

function formatAllowedTitles(allowed: AllowedTitle[]): string {
  return allowed.map(t=>{
    const eps=t.episodes?`${t.episodes} eps`:"? eps"; const year=t.year?` ${t.year}`:""; const rel=t.relationType?` [${t.relationType}]`:""; const main=t.isMainEntry?" [MAIN]":"";
    return `- ID: ${t.id} | "${t.title}" | ${t.format} | ${eps}${year}${rel}${main}`;
  }).join("\n");
}
function formatPreferences(p: AIGenerationPayloadV2["userPreferences"]): string {
  const l:string[]=[]; if(p.skipPreference) l.push(`Skip: ${p.skipPreference}`); if(p.includeMovies===false) l.push("Exclude movies"); if(p.includeOVAs===false) l.push("Exclude OVAs"); if(p.includeSpecials===false) l.push("Exclude specials"); if(p.mood&&p.mood.length&&!p.mood.includes("all")) l.push(`Mood: ${p.mood.join(",")}`); return l.length?l.join("\n"):"Default smart-skip";
}
const JSON_FOOTER = `
OUTPUT ONLY valid JSON, no markdown. Schema:
{
  "franchise":"string","classification":"mega_franchise|long_runner|canon_movie_sandwich|route_branching|remake_divergence|single_core",
  "classificationReason":"1 sentence","summary":"2-3 sentences","whyConfusing":"1 sentence","recommendedPathId":"id","confidence":80,
  "paths":[{"id":"path_main","name":"Main","description":"...","bestFor":["First timers"],"difficulty":"beginner","isSpoilerFree":true,"isRecommended":true,"groups":[{"id":"group_id","name":"...","description":"...","timelineType":"main_timeline|alternate_timeline|spin_off|movie_collection|season_block|side_story","orderNote":"...","entries":[{"id":"MUST be from Allowed list","tier":"essential|recommended|optional|skip","tierReason":"why","position":1,"groupPosition":1,"whyWatch":"rich 2-3 sentences, not generic","skipWarning":"what missed or null","watchIf":["You like X"],"contentTags":["Action"],"isFiller":false,"fillerType":"none|canon|mixed_canon_filler|pure_filler|recap|side_story","fillerReason":"max 10 words","arcName":"Arc name or null","episodeRange":"1-25 or null","watchAfter":"Watch after S1 ep11 or null","prerequisites":[]}]}],"warnings":[]}],"warnings":[]}
CRITICAL RULES:
1. EVERY id MUST be exactly from Allowed Titles. No invented IDs.
2. NEVER include MANGA, NOVEL, LIGHT_NOVEL, ONE_SHOT, MANHWA, MANHUA. ONLY TV, MOVIE, OVA, ONA, SPECIAL, TV_SHORT.
3. If you see title like "Chapter 1: A Day in the Capital" or "Chapter 2: A Week at the Mansion" - these are MANGA, you MUST SKIP them, do NOT include.
4. For Re:Zero, correct order is: S1 (25 eps) -> Memory Snow OVA (between ep11-12, 60min) -> Frozen Bond OVA (80min, prequel, watch after S1) -> S2 (25 eps: 13+12) -> S3 (16 eps) -> S4 (19 eps). Chibi shorts Break Time and Petit are optional TV_SHORT, watch anytime after S1.
5. Use at least 80% of allowedTitles for franchise scope.
6. For long runners, provide episodeRange and innerOrder.
7. tierReason and whyWatch must be specific with characters/arcs, not generic.
`;

export function buildMegaFranchisePrompt(p: AIGenerationPayloadV2): string {
  const allowed=formatAllowedTitles(p.allowedTitles); const prefs=formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for MEGA FRANCHISE "${p.franchiseName}".
WHY CONFUSING: ${p.whyConfusing}
This shape: Main Timeline core, Alternate Timelines what-if, Spin Offs same universe standalone, Movies may be canon.
For Fate: Main = Fate/Zero -> Stay Night routes (Fate 2006 Saber route, UBW Rin route, Heavens Feel Sakura route). Spin offs = Prisma Illya (parallel), Apocrypha (alternate war), Grand Order, Lord El-Melloi (sequel to Zero, Waver), Extra, Carnival Phantasm (parody). Group correctly.
For Monogatari: Release order Bakemonogatari->Nisemonogatari->Second Season etc, not chronological, explain why.
Tiers: essential=core main timeline, recommended=good spin off like Lord El-Melloi, optional=parody like Carnival Phantasm, skip=recap.
Allowed Titles (ONLY these IDs):
${allowed}
Prefs:${prefs}
Graph: ${p.verifiedGraphStats.totalNodes} nodes
Groups: ${p.groupsTemplate.map(g=>`- ${g.groupId}: ${g.groupName} - ${g.instruction}`).join("\n")}
${JSON_FOOTER}`;
}

export function buildLongRunnerPrompt(p: AIGenerationPayloadV2): string {
  const allowed=formatAllowedTitles(p.allowedTitles); const prefs=formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for LONG RUNNER "${p.franchiseName}".
WHY CONFUSING: ${p.whyConfusing}
This shape: 100+ eps, filler disrupts pacing, need canon/mixed/filler classification.
Job: For each TV entry, provide innerOrder ranges like {"start":1,"end":26,"type":"canon","title":"Intro Arc"} etc. Mark pure_filler skip, mixed recommended, canon essential.
Allowed:
${allowed}
Prefs:${prefs}
Groups: ${p.groupsTemplate.map(g=>`- ${g.groupId}: ${g.groupName}`).join("\n")}
${JSON_FOOTER}`;
}

export function buildCanonMovieSandwichPrompt(p: AIGenerationPayloadV2): string {
  const allowed=formatAllowedTitles(p.allowedTitles); const prefs=formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for CANON MOVIE SANDWICH "${p.franchiseName}".
WHY CONFUSING: ${p.whyConfusing}
This shape: TV seasons and movies/OVAs interleave, movies are NOT optional, they continue main plot. Skipping breaks continuity.
CORRECT EXAMPLES:
- Demon Slayer: S1 ep1-26 -> Mugen Train movie (is ep27-33 canon, required) -> S2 -> Swordsmith
- Jujutsu Kaisen: S1 -> Jujutsu 0 movie (prequel, watch after S1) -> S2
- Made in Abyss: S1 -> Movie 3 Dawn of Deep Soul (canon sequel) -> S2
- Re:ZERO DEFINITIVE CORRECT ORDER (MEMORIZE THIS):
  1. S1 (25 eps) - Essential. Introduces Subaru Return by Death. Director's Cut is 13 long eps, includes post-credits scene leading to S2.
  2. Memory Snow OVA (60min) - Highly Recommended. Chronologically between S1 ep11 and ep12, slice-of-life snow festival, sets up characters for later.
  3. Frozen Bond OVA (80min) - Essential. Prequel about Emilia and Pack in Elior Forest before S1, watch after S1 or after Memory Snow.
  4. S2 Parts 1&2 (25 eps total: 13+12) - Essential. Sanctuary Arc, Witches of Sin, Subaru/Emilia/Beatrice growth. Episodes 26-50.
  5. S3 (16 eps) - Essential. Water Gate City Priestella Arc, 90min theatrical premiere Theatrical Malice, vs Sin Archbishops. Eps 51-66.
  6. S4 (19 eps) - Essential. Pleiades Watchtower Arc 6, Loss Arc 11 eps (67-77) + Recapture Arc 8 eps (78-85).
  Optional shorts: Break Time From Zero, Petit - chibi comedy, optional, watch anytime after S1. NEVER include Chapter 1 Day in Capital or Chapter 2 Week at Mansion - those are MANGA, not anime.
Your job:
1. Identify canon vs non-canon movies/OVAs. Canon = essential, non-canon = optional.
2. For each canon movie/OVA, set watchAfter: "Watch after Season 1 Episode 11" or "Watch after S1" etc.
3. Set tier essential for canon that continues plot, recommended for canon prequels that add lore, optional for chibi shorts, skip for recap.
4. Explain in whyWatch WHY required: "Direct continuation, adapts light novel volume X" or "Sets up Emilia backstory needed for S2 emotional payoff"
5. Provide 2 paths: Main Story (essential only) and Completionist (includes optional shorts)
Allowed Titles - ONLY THESE, NEVER MANGA:
${allowed}
Prefs:${prefs}
Groups: ${p.groupsTemplate.map(g=>`- ${g.groupId}: ${g.groupName}`).join("\n")}
${JSON_FOOTER}`;
}

export function buildRouteBranchingPrompt(p: AIGenerationPayloadV2): string {
  const allowed=formatAllowedTitles(p.allowedTitles); const prefs=formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for ROUTE BRANCHING "${p.franchiseName}".
WHY CONFUSING: ${p.whyConfusing}
This shape: Common route then diverges into parallel realities, NOT sequels. Watching Route B does NOT require Route A.
Example Fate/stay night: 2006 = Fate route Saber focus, UBW = Rin route ideology, Heavens Feel trilogy = Sakura dark true ending. Recommended order: UBW first (modern), then 2006 or Heavens Feel last as finale. Explain route differences.
Example Clannad: After Story is sequel, but Clannad has Nagisa main.
Example Steins;Gate: main then 0 is alternative timeline after bad ending, watch after main.
Job: Identify common, each divergent route, explain focus character/tone, tier essential for main routes, paths: Release Order preserves mystery, Chronological for lore.
Allowed:
${allowed}
Prefs:${prefs}
Groups: ${p.groupsTemplate.map(g=>`- ${g.groupId}: ${g.groupName} - ${g.instruction}`).join("\n")}
${JSON_FOOTER}`;
}

export function buildRemakeDivergencePrompt(p: AIGenerationPayloadV2): string {
  const allowed=formatAllowedTitles(p.allowedTitles); const prefs=formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for REMAKE DIVERGENCE "${p.franchiseName}".
WHY CONFUSING: ${p.whyConfusing}
This shape: Original and remake tell same story differently. Usually remake more faithful and recommended.
Example FMA vs FMAB: FMA 2003 diverges after ep30 original ending, FMAB 2009 100% manga faithful. Recommend FMAB essential, FMA optional for alt ending.
Example HxH 1999 vs 2011: 2011 definitive continues further.
Example Fruits Basket 2001 vs 2019: 2019 complete.
Job: Compare versions, tier essential definitive, paths: Definitive (remake only), Purist (original), Completionist (both).
Allowed:
${allowed}
Prefs:${prefs}
Groups: ${p.groupsTemplate.map(g=>`- ${g.groupId}: ${g.groupName}`).join("\n")}
${JSON_FOOTER}`;
}

export function buildSingleCorePrompt(p: AIGenerationPayloadV2): string {
  const allowed=formatAllowedTitles(p.allowedTitles); const prefs=formatPreferences(p.userPreferences);
  return `You are ChronoFlow expert for SINGLE CORE "${p.franchiseName}".
This shape: 1-3 seasons linear, maybe 1 optional movie. No confusing timelines, just release order. Confirm order simple, mark OVAs optional.
Allowed:
${allowed}
Prefs:${prefs}
${JSON_FOOTER}`;
}

export function buildPromptForShape(shape: AnimeShape, payload: AIGenerationPayloadV2): string {
  switch(shape){
    case "mega_franchise": return buildMegaFranchisePrompt(payload);
    case "long_runner": return buildLongRunnerPrompt(payload);
    case "canon_movie_sandwich": return buildCanonMovieSandwichPrompt(payload);
    case "route_branching": return buildRouteBranchingPrompt(payload);
    case "remake_divergence": return buildRemakeDivergencePrompt(payload);
    default: return buildSingleCorePrompt(payload);
  }
}

export function createGenerationPayload(params:{franchiseName:string;allowedTitles:AllowedTitle[];shape:AnimeShape;whyConfusing:string;userPreferences:AIGenerationPayloadV2["userPreferences"];groupsTemplate:Array<{id:string;name:string;timelineType:any;description:string;allowedEntryIds?:string[];instruction?:string}>;graphStats:{totalNodes:number;sources:string[]};}):AIGenerationPayloadV2{
  return {
    franchiseName:params.franchiseName, classification:params.shape, whyConfusing:params.whyConfusing, allowedTitles:params.allowedTitles,
    groupsTemplate:params.groupsTemplate.map(g=>({groupId:g.id,groupName:g.name,timelineType:g.timelineType,allowedEntryIds:g.allowedEntryIds||params.allowedTitles.map(t=>t.id),instruction:g.instruction||g.description})),
    userPreferences:params.userPreferences, verifiedGraphStats:{totalNodes:params.graphStats.totalNodes,sources:params.graphStats.sources},
  };
}
