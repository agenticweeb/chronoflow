/**
 * ChronoFlow Relation Graph Builder - V6 (Soft Flagging Architecture)
 * 
 * CRITICAL FIX: Eliminates ALL hard rejection gates.
 * Validation now only FLAGS suspicious entries; AI decides inclusion.
 * Works for ALL anime types: studio-switchers, long-runners, generic-word franchises.
 */

import { RawRelationNode, RelationGraph, AllowedTitle, EntryFormat } from "@/types/intelligent";

function parseFormat(f?: string | null, ty?: string | null): EntryFormat {
  const raw = (f || ty || "TV").toUpperCase();
  if (raw === "MOVIE") return "MOVIE";
  if (raw === "OVA") return "OVA";
  if (raw === "ONA") return "ONA";
  if (raw === "SPECIAL") return "SPECIAL";
  if (raw === "TV_SHORT") return "TV" as any;
  if (raw === "MUSIC") return "SPECIAL";
  if (["MANGA", "NOVEL", "LIGHT_NOVEL", "ONE_SHOT", "DOUJIN", "DOUJINSHI", "MANHWA", "MANHUA"].includes(raw)) return "MANGA" as any;
  return "TV";
}

function isAnimeFormat(f?: string | null) {
  if (!f) return true;
  const x = f.toUpperCase();
  return !["MANGA", "NOVEL", "LIGHT_NOVEL", "ONE_SHOT", "DOUJIN", "DOUJINSHI", "MANHWA", "MANHUA", "MUSIC"].includes(x);
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

const ENDPOINT = "https://graphql.anilist.co";

const MEDIA_Q = `query($id:Int){Media(id:$id,type:ANIME){id idMal title{romaji english native} format episodes duration status averageScore popularity description genres startDate{year} coverImage{large medium color} trailer{id site} nextAiringEpisode{episode} studios{edges{isMain node{name id}}} relations{edges{relationType node{id idMal title{romaji english native} format episodes duration status averageScore popularity startDate{year} coverImage{large medium color} description genres trailer{id site} nextAiringEpisode{episode} studios{edges{isMain node{name id}}}}}}}}`;

const SEARCH_Q = `query($search:String,$perPage:Int){Page(perPage:$perPage){media(search:$search,type:ANIME,sort:POPULARITY_DESC){id idMal title{romaji english native} format episodes duration status averageScore popularity startDate{year} coverImage{large medium color} description genres trailer{id site} nextAiringEpisode{episode} studios{edges{isMain node{name id}}}}}}`;

async function fetchWithRetry(body: any, retries = 3) {
  for (let a = 0; a <= retries; a++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        next: { revalidate: 3600 } as any
      });
      if (res.ok) {
        const j = await res.json();
        return j?.data;
      }
      if (res.status === 429) {
        const w = Math.min(800 + Math.pow(2, a) * 600 + Math.random() * 400, 7000);
        console.warn(`AniList 429 retry ${a + 1} wait ${Math.round(w)}ms`);
        await sleep(w);
        continue;
      }
      if (res.status >= 500 && a < retries) {
        await sleep(400 * (a + 1));
        continue;
      }
      return null;
    } catch (e) {
      if (a === retries) return null;
      await sleep(350 * (a + 1));
    }
  }
  return null;
}

async function fetchAniListMedia(id: number): Promise<any | null> {
  const data = await fetchWithRetry({ query: MEDIA_Q, variables: { id } });
  return data?.Media || null;
}

async function searchAniListForRoot(search: string, perPage = 5): Promise<any | null> {
  const data = await fetchWithRetry({ query: SEARCH_Q, variables: { search, perPage } });
  const results = (data?.Page?.media || []).filter((m: any) => isAnimeFormat(m.format));
  return results[0] || null;
}

function anilistToRaw(node: any, depth: number, relType?: string, src?: number): RawRelationNode {
  const title = node.title?.english || node.title?.romaji || node.title?.native || "Unknown";
  return {
    anilistId: node.id,
    malId: node.idMal || undefined,
    title,
    titleEnglish: node.title?.english || undefined,
    titleRomaji: node.title?.romaji || undefined,
    titleNative: node.title?.native || undefined,
    format: node.format || undefined,
    type: node.format || undefined,
    episodes: node.episodes ?? undefined,
    duration: node.duration ?? undefined,
    status: node.status || undefined,
    averageScore: node.averageScore ?? undefined,
    popularity: node.popularity || 0,
    coverImage: node.coverImage || undefined,
    genres: node.genres || [],
    description: node.description || undefined,
    trailer: node.trailer || null,
    relationType: relType || undefined,
    sourceId: src,
    depth,
    year: node.startDate?.year || undefined,
    nextAiringEpisode: node.nextAiringEpisode || null,
    studios: node.studios?.edges?.filter((e: any) => e.isMain).map((e: any) => e.node?.name).filter(Boolean) || [],
  } as any;
}

const FRANCHISE_RELATIONS = [
  'SEQUEL', 'PREQUEL', 'PARENT', 'SIDE_STORY', 
  'SPIN_OFF', 'ALTERNATIVE', 'ADAPTATION'
];

function computeLexicalScore(rootTitle: string, candidateTitle: string): number {
  const rootWords = rootTitle.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 3);
  const candWords = candidateTitle.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 3);
  const generic = new Set(['the', 'and', 'story', 'tale', 'saga', 'chronicle', 'legend', 'movie', 'special']);
  let score = 0;
  for (const rw of rootWords) {
    if (generic.has(rw)) continue;
    if (candWords.some(cw => cw.includes(rw) || rw.includes(cw))) {
      score += rw.length;
    }
  }
  return score;
}

function flagSuspiciousEntries(root: RawRelationNode, nodes: Map<number, RawRelationNode>): Map<number, string[]> {
  const flags = new Map<number, string[]>();
  const rootTitle = root.titleEnglish || root.titleRomaji || root.title || "";
  const rootStudios = new Set((root as any).studios || []);

  for (const [id, node] of nodes) {
    if (node.depth === 0) continue;
    const nodeFlags: string[] = [];
    const relType = (node.relationType || "").toUpperCase();

    // FIX: Flag studio mismatch for ALL entries and include the actual studio names
    const nodeStudios = (node as any).studios || [];
    if (rootStudios.size > 0 && nodeStudios.length > 0) {
      const hasOverlap = nodeStudios.some((s: string) => rootStudios.has(s));
      if (!hasOverlap) {
        const rootStudio = Array.from(rootStudios).find(Boolean) || 'Unknown';
        const nodeStudio = nodeStudios.find(Boolean) || 'Unknown';
        nodeFlags.push(`different-studio:${rootStudio}:${nodeStudio}`);
      }
    }

    if (relType !== 'SEQUEL' && relType !== 'PREQUEL') {
      const score = computeLexicalScore(rootTitle, node.title || "");
      if (score === 0) nodeFlags.push('no-title-overlap');
    }

    if (nodeFlags.length > 0) flags.set(id, nodeFlags);
  }
  return flags;
}

export interface BuildGraphParams { 
  title: string; 
  anilistId?: number; 
  malId?: number; 
  scope: "season" | "franchise"; 
  maxDepth?: number; 
}

export async function buildRelationGraph(params: BuildGraphParams) {
  const warnings: string[] = [];
  const maxDepth = params.maxDepth ?? (params.scope === "franchise" ? 6 : 0);
  
  let root: RawRelationNode | null = null;
  
  if (params.anilistId) {
    const media = await fetchAniListMedia(params.anilistId);
    if (media && isAnimeFormat(media.format)) {
      root = anilistToRaw(media, 0);
    }
  }
  
  if (!root) {
    const bestMatch = await searchAniListForRoot(params.title, 5);
    if (!bestMatch) throw new Error(`No anime found for "${params.title}"`);
    const media = await fetchAniListMedia(bestMatch.id);
    if (media && isAnimeFormat(media.format)) {
      root = anilistToRaw(media, 0);
    }
  }
  
  if (!root) throw new Error(`Failed to fetch root node for "${params.title}"`);

  const nodes = new Map<number, RawRelationNode>();
  const edges: Array<{ from: number; to: number; type: string }> = [];
  const visited = new Set<number>();
  const queue: Array<{ id: number; depth: number }> = [{ id: root.anilistId, depth: 0 }];
  
  nodes.set(root.anilistId, root);
  
  while (queue.length > 0) {
    const { id: currentId, depth } = queue.shift()!;
    
    if (visited.has(currentId) || depth >= maxDepth) continue;
    visited.add(currentId);
    
    const media = await fetchAniListMedia(currentId);
    if (!media) {
      warnings.push(`Failed to fetch relations for ID ${currentId}`);
      continue;
    }
    
    if (!nodes.has(media.id)) {
      nodes.set(media.id, anilistToRaw(media, depth));
    }
    
    for (const edge of media.relations?.edges || []) {
      const relationType = (edge.relationType || "unknown").toUpperCase();
      const relatedNode = edge.node;
      
      if (!relatedNode?.id) continue;
      if (!isAnimeFormat(relatedNode.format)) {
        warnings.push(`Skipped non-anime ${relatedNode.format}: ${relatedNode.title?.romaji}`);
        continue;
      }
      
      if (!FRANCHISE_RELATIONS.includes(relationType)) {
        if (relationType === 'CHARACTER' || relationType === 'OTHER') {
          warnings.push(`Crossover pruned: ${relatedNode.title?.romaji} (${relationType})`);
        }
        continue;
      }
      
      edges.push({ from: currentId, to: relatedNode.id, type: relationType });
      
      if (!nodes.has(relatedNode.id)) {
        nodes.set(relatedNode.id, anilistToRaw(relatedNode, depth + 1, relationType, currentId));
      }
      
      if (!visited.has(relatedNode.id)) {
        queue.push({ id: relatedNode.id, depth: depth + 1 });
      }
    }
  }

  const flags = flagSuspiciousEntries(root, nodes);
  const flaggedCount = flags.size;
  if (flaggedCount > 0) {
    warnings.push(`${flaggedCount} entries flagged for AI review (studio/title mismatch)`);
  }
  
  const allowed = Array.from(nodes.values())
    .filter(n => isAnimeFormat(n.format as any))
    .map(node => {
      const nodeFlags = flags.get(node.anilistId) || [];
      const aliases = [
        node.titleEnglish || "", 
        node.titleRomaji || "", 
        node.titleNative || "", 
        node.title || ""
      ].filter(Boolean) as string[];
      
      return {
        id: `ani_${node.anilistId}`,
        anilistId: node.anilistId,
        malId: node.malId,
        title: node.title,
        normalizedTitle: node.title.toLowerCase().replace(/[^a-z0-9]/g, ""),
        aliases: Array.from(new Set(aliases)),
        format: parseFormat(node.format, node.type),
        episodes: node.episodes,
        duration: node.duration,
        year: (node as any).year,
        popularity: node.popularity || 0,
        relationType: node.relationType,
        isMainEntry: node.depth === 0,
        status: (node as any).status,
        nextAiringEpisode: (node as any).nextAiringEpisode,
        flags: nodeFlags,
      };
    });
  
  allowed.sort((a, b) => {
    const na = nodes.get(a.anilistId);
    const nb = nodes.get(b.anilistId);
    const d = (na?.depth || 0) - (nb?.depth || 0);
    if (d !== 0) return d;
    return (b.popularity || 0) - (a.popularity || 0);
  });
  
  const graph = { 
    root: root!, 
    nodes, 
    edges, 
    totalDiscovered: nodes.size, 
    maxDepth 
  };
  
  return { graph, allowedTitles: allowed, root: root!, warnings };
}

export function findAllowedTitleById(a: any[], id: string | number) {
  const s = String(id);
  return a.find(x => x.id === s || String(x.anilistId) === s || (x.malId && String(x.malId) === s));
}

export function findAllowedTitleByFuzzy(a: any[], q: string) {
  const n = q.toLowerCase().replace(/[^a-z0-9]/g, "");
  return a.find(x => x.normalizedTitle === n || x.aliases.some((al: string) => al.toLowerCase().replace(/[^a-z0-9]/g, "") === n));
}
