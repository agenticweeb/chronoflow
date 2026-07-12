/**
 * ChronoFlow Shape Classifier V2.1
 * Fixes: Fate always mega, Re:Zero always canon_movie_sandwich, no more route_branching misclassify
 */

import { AnimeShape, ShapeDetectionResult, AllowedTitle, RelationGraph } from "@/types/intelligent";

interface Signals {
  totalNodes: number; totalEdges: number; avgEpisodes: number; maxEpisodes: number; totalEpisodesSum: number;
  movieCount: number; tvCount: number; ovaCount: number; specialCount: number;
  relationTypes: Set<string>; hasAlternative: boolean; hasSpinOff: boolean; hasSideStory: boolean; hasPrequelSequel: boolean;
  uniqueYears: Set<number>; duplicateTitles: number; rootEpisodes?: number; rootFormat?: string;
  sequelCount: number; prequelCount: number; sideStoryCount: number;
}

function collectSignals(graph: RelationGraph): Signals {
  const s: Signals = {
    totalNodes: graph.nodes.size, totalEdges: graph.edges.length, avgEpisodes: 0, maxEpisodes: 0, totalEpisodesSum: 0,
    movieCount: 0, tvCount: 0, ovaCount: 0, specialCount: 0,
    relationTypes: new Set(), hasAlternative: false, hasSpinOff: false, hasSideStory: false, hasPrequelSequel: false,
    uniqueYears: new Set(), duplicateTitles: 0, rootEpisodes: graph.root.episodes, rootFormat: graph.root.format,
    sequelCount: 0, prequelCount: 0, sideStoryCount: 0,
  };
  const titleMap = new Map<string, number>(); let epSum=0, epCount=0, maxEp=0;
  for (const node of Array.from(graph.nodes.values())) {
    const fmt = (node.format||"TV").toUpperCase();
    if (fmt==="MOVIE") s.movieCount++; else if (fmt==="TV") s.tvCount++; else if (fmt==="OVA"||fmt==="ONA") s.ovaCount++; else if (fmt==="SPECIAL") s.specialCount++;
    if (node.episodes){ epSum+=node.episodes; epCount++; if(node.episodes>maxEp) maxEp=node.episodes; }
    if (node.relationType){ s.relationTypes.add(node.relationType); const rt=node.relationType.toLowerCase();
      if(rt.includes("alternative")) s.hasAlternative=true; if(rt.includes("spin")) s.hasSpinOff=true;
      if(rt.includes("side")) { s.hasSideStory=true; s.sideStoryCount++; }
      if(rt.includes("prequel")){ s.hasPrequelSequel=true; s.prequelCount++; }
      if(rt.includes("sequel")){ s.hasPrequelSequel=true; s.sequelCount++; }
    }
    const norm=(node.title||"").toLowerCase().replace(/[^a-z0-9]/g,""); const c=titleMap.get(norm)||0; titleMap.set(norm,c+1); if(c>=1) s.duplicateTitles++;
  }
  for (const e of graph.edges){ s.relationTypes.add(e.type); const t=e.type.toLowerCase();
    if(t.includes("alternative")) s.hasAlternative=true; if(t.includes("spin")) s.hasSpinOff=true;
    if(t.includes("side")){ s.hasSideStory=true; s.sideStoryCount++; }
    if(t.includes("prequel")){ s.prequelCount++; s.hasPrequelSequel=true; }
    if(t.includes("sequel")){ s.sequelCount++; s.hasPrequelSequel=true; }
  }
  s.totalEpisodesSum=epSum; s.avgEpisodes=epCount?Math.round(epSum/epCount):0; s.maxEpisodes=maxEp; return s;
}

const MEGA_KEYWORDS=["fate","monogatari","gundam","jojo","precure","toaru","index","railgun","gintama","dragon ball","one piece","naruto","bleach","pokemon","yugioh","macross","love live","idolmaster"];
const LONG_TITLES=["one piece","naruto","bleach","gintama","dragon ball","fairy tail","black clover","hunter x hunter"];
const CANON_MOVIE=["demon slayer","kimetsu","jujutsu kaisen","my hero academia","boku no hero","violet evergarden","made in abyss","re:zero","rezero"];
const ROUTE_TITLES=["fate/stay night","clannad","steins;gate","higurashi","umineko","kanon","air","little busters"];
const REMAKE_TITLES=["fullmetal alchemist","hunter x hunter","fruits basket","shaman king","dororo","berserk","evangelion","trigun","rurouni kenshin"];

export function classifyAnimeShape(graph: RelationGraph, allowed: AllowedTitle[], rootTitle: string): ShapeDetectionResult {
  const lower=rootTitle.toLowerCase(); const signals=collectSignals(graph);
  let scores: Record<AnimeShape,number>={ mega_franchise:0, long_runner:0, canon_movie_sandwich:0, route_branching:0, remake_divergence:0, single_core:0 };
  let reasons:string[]=[];

  // ── STRONG OVERRIDES FIRST ────────────────────────────────
  // Fate is ALWAYS mega_franchise
  if (lower.includes("fate")) {
    return { shape:"mega_franchise", confidence:95, reasoning:"Override: Fate franchise is always mega_franchise with multiple timelines", signals:{ totalNodes:signals.totalNodes, episodeCount:signals.totalEpisodesSum, relationTypes:Array.from(signals.relationTypes), hasMoviesAsCanon:true, hasMultipleRoutes:true, hasRemakes:signals.duplicateTitles>0 } };
  }
  // Monogatari always mega
  if (lower.includes("monogatari")) {
    return { shape:"mega_franchise", confidence:96, reasoning:"Override: Monogatari is always mega_franchise", signals:{ totalNodes:signals.totalNodes, episodeCount:signals.totalEpisodesSum, relationTypes:Array.from(signals.relationTypes), hasMoviesAsCanon:false, hasMultipleRoutes:false, hasRemakes:false } };
  }
  // JoJo is always mega franchise
  if (lower.includes("jojo")) {
    return { shape:"mega_franchise", confidence:94, reasoning:"Override: JoJo's Bizarre Adventure spans generations and alternate universes", signals:{ totalNodes:signals.totalNodes, episodeCount:signals.totalEpisodesSum, relationTypes:Array.from(signals.relationTypes), hasMoviesAsCanon:false, hasMultipleRoutes:false, hasRemakes:false } };
  }
  // Gundam is a mega franchise of timelines and alternate universes
  if (lower.includes("gundam")) {
    return { shape:"mega_franchise", confidence:92, reasoning:"Override: Gundam spans multiple universes and timelines across many series", signals:{ totalNodes:signals.totalNodes, episodeCount:signals.totalEpisodesSum, relationTypes:Array.from(signals.relationTypes), hasMoviesAsCanon:false, hasMultipleRoutes:true, hasRemakes:false } };
  }
  // Long runner staples should not be misclassified as routes
  if (
    lower.includes("one piece") ||
    lower.includes("naruto") ||
    lower.includes("bleach") ||
    lower.includes("dragon ball") ||
    lower.includes("hunter x hunter")
  ) {
    return { shape:"long_runner", confidence:92, reasoning:"Override: This title is a long runner with many episodes and filler arcs, not route branching", signals:{ totalNodes:signals.totalNodes, episodeCount:signals.totalEpisodesSum, relationTypes:Array.from(signals.relationTypes), hasMoviesAsCanon:false, hasMultipleRoutes:false, hasRemakes:false } };
  }
  // Re:Zero is ALWAYS canon_movie_sandwich (linear + canon OVAs Memory Snow / Frozen Bond)
  if (lower.includes("re:zero") || lower.includes("rezero") || lower.includes("re zero")) {
    return { shape:"canon_movie_sandwich", confidence:92, reasoning:"Override: Re:Zero is linear story with canon OVAs Memory Snow and Frozen Bond between seasons, not route branching", signals:{ totalNodes:signals.totalNodes, episodeCount:signals.totalEpisodesSum, relationTypes:Array.from(signals.relationTypes), hasMoviesAsCanon:true, hasMultipleRoutes:false, hasRemakes:false } };
  }
  if (lower.includes("demon slayer") || lower.includes("kimetsu") || lower.includes("jujutsu kaisen") || lower.includes("boku no hero") || lower.includes("my hero academia")) {
    return { shape:"canon_movie_sandwich", confidence:90, reasoning:"Override: This franchise has canon movies or OVAs that belong in the main story order", signals:{ totalNodes:signals.totalNodes, episodeCount:signals.totalEpisodesSum, relationTypes:Array.from(signals.relationTypes), hasMoviesAsCanon:true, hasMultipleRoutes:false, hasRemakes:false } };
  }

  // ── Mega Franchise ────────────────────────────────────────
  if (signals.totalNodes>=15){ scores.mega_franchise+=40; reasons.push(`${signals.totalNodes} entries`); } else if(signals.totalNodes>=8) scores.mega_franchise+=20;
  if (signals.hasAlternative && signals.hasSpinOff) scores.mega_franchise+=25; else if(signals.hasSpinOff) scores.mega_franchise+=10;
  if (signals.totalEdges>=12) scores.mega_franchise+=15;
  if (MEGA_KEYWORDS.some(k=>lower.includes(k))) scores.mega_franchise+=25;

  // ── Long Runner ───────────────────────────────────────────
  if ((signals.rootEpisodes&&signals.rootEpisodes>=100)||signals.maxEpisodes>=100){ scores.long_runner+=45; reasons.push(`max eps ${signals.maxEpisodes} >=100`); }
  else if ((signals.rootEpisodes&&signals.rootEpisodes>=50)||signals.maxEpisodes>=50) scores.long_runner+=20;
  if (signals.totalEpisodesSum>=400) scores.long_runner+=20;
  if (LONG_TITLES.some(k=>lower.includes(k))) scores.long_runner+=30;

  // ── Canon Movie Sandwich ──────────────────────────────────
  // Re:Zero, Demon Slayer, Jujutsu pattern: many sequels + movies/OVAs that are canon and sit between seasons
  if (signals.movieCount>=1 && signals.ovaCount>=1 && signals.sequelCount>=2){ scores.canon_movie_sandwich+=40; reasons.push(`movies ${signals.movieCount} + OVAs ${signals.ovaCount} + sequels ${signals.sequelCount}`); }
  else if (signals.movieCount>=1 && signals.sequelCount>=2){ scores.canon_movie_sandwich+=30; }
  else if (signals.movieCount>=1 && signals.hasSideStory) scores.canon_movie_sandwich+=20;
  if (CANON_MOVIE.some(k=>lower.includes(k))) scores.canon_movie_sandwich+=25;
  if (signals.sideStoryCount>=2 && signals.sequelCount>=1) scores.canon_movie_sandwich+=15;

  // ── Route Branching ───────────────────────────────────────
  // Must have multiple alternatives AND low sequel chain, otherwise it's just Director's Cut alternative
  const altCount = Array.from(graph.edges).filter(e=>e.type.toLowerCase().includes("alternative")).length;
  if (altCount>=2 && signals.sequelCount<=2){ scores.route_branching+=35; reasons.push(`${altCount} alternatives, few sequels`); }
  else if (altCount>=2 && signals.sequelCount>=3){
    // If many sequels, alternative is likely Director's Cut, not true route branching
    scores.route_branching+=5; scores.canon_movie_sandwich+=15;
    reasons.push(`Alternatives likely Director's Cut, boosting canon sandwich`);
  } else if (altCount>=1) scores.route_branching+=10;
  if (ROUTE_TITLES.some(k=>lower.includes(k))) scores.route_branching+=30;

  // ── Remake ────────────────────────────────────────────────
  if (signals.duplicateTitles>=1){ scores.remake_divergence+=30; }
  if (REMAKE_TITLES.some(k=>lower.includes(k))) scores.remake_divergence+=30;
  if (Array.from(signals.relationTypes).some(t=>t.toLowerCase().includes("remake"))) scores.remake_divergence+=40;

  // ── Single Core ───────────────────────────────────────────
  if (signals.totalNodes<=3 && signals.movieCount===0) scores.single_core+=30;
  if (signals.totalNodes===1) scores.single_core+=50;

  let best: AnimeShape="single_core"; let bestScore=-1;
  for (const [shape,score] of Object.entries(scores) as Array<[AnimeShape,number]>){ if(score>bestScore){ bestScore=score; best=shape; } }
  const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]); const second=sorted[1]?.[1]||0; const gap=bestScore-second;
  let confidence=Math.min(95,Math.max(40,50+gap)); if(bestScore<20) confidence=40;

  // Final safety: if sequel chain >=3, prefer canon_movie_sandwich over route_branching
  if (signals.sequelCount>=3 && best==="route_branching"){ best="canon_movie_sandwich"; confidence=80; reasons.unshift(`Override: sequel chain ${signals.sequelCount} indicates linear story with canon movies, not routes`); }

  return { shape:best, confidence, reasoning:reasons.join(" | ")||`Classified as ${best} score ${bestScore}`, signals:{ totalNodes:signals.totalNodes, episodeCount:signals.totalEpisodesSum, relationTypes:Array.from(signals.relationTypes), hasMoviesAsCanon:signals.movieCount>0, hasMultipleRoutes:altCount>=2, hasRemakes:signals.duplicateTitles>0 } };
}

export function getGroupTemplateForShape(shape: AnimeShape, graph: RelationGraph){
  switch(shape){
    case "mega_franchise": return [
      {id:"main_timeline",name:"Main Timeline",timelineType:"main_timeline",description:"Core story that defines the franchise"},
      {id:"alternate_timeline",name:"Alternate Timelines",timelineType:"alternate_timeline",description:"What-if stories and alternative versions"},
      {id:"spin_offs",name:"Spin Offs & Side Stories",timelineType:"spin_off",description:"Expanded universe, prequels like Lord El-Melloi, comedy like Carnival Phantasm"},
      {id:"movies_collection",name:"Movies & Specials",timelineType:"movie_collection",description:"Films and specials"},
    ];
    case "canon_movie_sandwich": return [
      {id:"main_timeline",name:"Main Timeline - TV Seasons",timelineType:"main_timeline",description:"Watch TV seasons in order"},
      {id:"canon_movies",name:"Canon Movies & OVAs - Required",timelineType:"movie_collection",description:"Canon OVAs like Memory Snow (between S1 ep11-12) and Frozen Bond (prequel, watch after S1) - required for continuity"},
      {id:"side_stories",name:"Side Stories & Shorts",timelineType:"side_story",description:"Chibi shorts like Break Time and Petit - optional, watch anytime after S1"},
    ];
    case "long_runner": return [
      {id:"canon_core",name:"Canon Core",timelineType:"main_timeline",description:"Main canon episodes"},
      {id:"mixed",name:"Mixed Canon / Light Filler",timelineType:"season_block",description:"Mostly canon with some filler"},
      {id:"filler",name:"Pure Filler (Skippable)",timelineType:"side_story",description:"Skip these"},
    ];
    case "route_branching": return [
      {id:"common",name:"Common Route / Introduction",timelineType:"main_timeline",description:"Where all routes start"},
      {id:"route_a",name:"Route A",timelineType:"alternate_timeline",description:"First route"},
      {id:"route_b",name:"Route B",timelineType:"alternate_timeline",description:"Second route"},
      {id:"true",name:"True Ending",timelineType:"main_timeline",description:"Final route"},
    ];
    case "remake_divergence": return [
      {id:"original",name:"Original",timelineType:"main_timeline",description:"Original version"},
      {id:"remake",name:"Remake",timelineType:"alternate_timeline",description:"Modern remake"},
      {id:"movies",name:"Movies",timelineType:"movie_collection",description:"Pick continuity"},
    ];
    default: return [
      {id:"main",name:"Main Story",timelineType:"main_timeline",description:"Complete watch order"},
      {id:"extras",name:"Extras",timelineType:"side_story",description:"Optional"},
    ];
  }
}
