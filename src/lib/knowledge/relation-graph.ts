
import { RawRelationNode, RelationGraph, AllowedTitle, EntryFormat } from "@/types/intelligent";
import { normalizeTitle, scoreTitleMatch, selectBestAnimeMatch } from "./title-matcher";
function parseFormat(f?:string|null, ty?:string|null):EntryFormat{ const raw=(f||ty||"TV").toUpperCase(); if(raw==="MOVIE") return "MOVIE"; if(raw==="OVA") return "OVA"; if(raw==="ONA") return "ONA"; if(raw==="SPECIAL") return "SPECIAL"; if(raw==="TV_SHORT") return "TV" as any; if(raw==="MUSIC") return "SPECIAL"; if(["MANGA","NOVEL","LIGHT_NOVEL","ONE_SHOT","DOUJIN","DOUJINSHI","MANHWA","MANHUA"].includes(raw)) return "MANGA" as any; return "TV"; }
function isAnimeFormat(f?:string|null){ if(!f) return true; const x=f.toUpperCase(); return !["MANGA","NOVEL","LIGHT_NOVEL","ONE_SHOT","DOUJIN","DOUJINSHI","MANHWA","MANHUA","MUSIC"].includes(x); }
function sleep(ms:number){ return new Promise(r=>setTimeout(r,ms)); }
const ENDPOINT="https://graphql.anilist.co";
const MEDIA_Q=`query($id:Int){Media(id:$id,type:ANIME){id idMal title{romaji english native} format episodes duration status averageScore popularity description genres startDate{year} coverImage{large medium color} trailer{id site} relations{edges{relationType node{id idMal title{romaji english native} format episodes duration status averageScore popularity startDate{year} coverImage{large medium color} description genres trailer{id site}}}}}}`;
const SEARCH_Q=`query($search:String,$perPage:Int){Page(perPage:$perPage){media(search:$search,type:ANIME,sort:POPULARITY_DESC){id idMal title{romaji english native} format episodes duration status averageScore popularity startDate{year} coverImage{large medium color} description genres trailer{id site}}}}`;

async function fetchWithRetry(body:any, retries=3){
  for(let a=0;a<=retries;a++){
    try{
      const res=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),next:{revalidate:3600} as any});
      if(res.ok){ const j=await res.json(); return j?.data; }
      if(res.status===429){ const w=Math.min(800+Math.pow(2,a)*600+Math.random()*400,7000); console.warn(`AniList 429 retry ${a+1} wait ${Math.round(w)}ms`); await sleep(w); continue; }
      if(res.status>=500 && a<retries){ await sleep(400*(a+1)); continue; }
      return null;
    }catch(e){ if(a===retries) return null; await sleep(350*(a+1)); }
  }
  return null;
}
async function fetchAniListMedia(id:number):Promise<any|null>{
  const data=await fetchWithRetry({query:MEDIA_Q,variables:{id}});
  return data?.Media||null;
}
function sanitizeForSearch(q:string):string[]{
  const base=q.trim();
  const variants=new Set<string>();
  variants.add(base);
  // "Re:ZERO -Starting Life in Another World-" -> "Re:Zero", "Re Zero", "ReZERO"
  const cleaned=base.replace(/[:;!?"'()\[\]]/g," ").replace(/\s*-\s*/g," ").replace(/\s+/g," ").trim();
  variants.add(cleaned);
  const noPunct=cleaned.replace(/[^a-zA-Z0-9\s]/g," ").replace(/\s+/g," ").trim();
  variants.add(noPunct);
  const firstTwo=noPunct.split(/\s+/).slice(0,2).join(" ");
  if(firstTwo.length>=3) variants.add(firstTwo);
  const wordsNoPunct = noPunct.split(/\s+/).filter(Boolean);
  if (wordsNoPunct.length === 1) {
    const first = wordsNoPunct[0];
    if(first && first.length>=3) variants.add(first);
  }
  // Special case Re:Zero
  if(/re/i.test(base) && /zero/i.test(base)) variants.add("Re:Zero");
  return Array.from(variants).filter(v=>v.length>=2).slice(0,4);
}
async function searchAniListForGraph(search:string, perPage=25):Promise<any[]>{
  const tries=sanitizeForSearch(search);
  for(const q of tries){
    const data=await fetchWithRetry({query:SEARCH_Q,variables:{search:q,perPage}});
    const list=(data?.Page?.media||[]).filter((m:any)=>isAnimeFormat(m.format));
    if(list.length>0){
      return list
        .map((item:any) => ({ item, score: scoreTitleMatch(search, item) }))
        .sort((a:any,b:any)=>b.score-a.score)
        .map((entry:any)=>entry.item);
    }
  }
  return [];
}
function anilistToRaw(node:any, depth:number, relType?:string, src?:number):RawRelationNode{
  const title=node.title?.english||node.title?.romaji||node.title?.native||"Unknown";
  return { anilistId:node.id, malId:node.idMal||undefined, title, titleEnglish:node.title?.english||undefined, titleRomaji:node.title?.romaji||undefined, titleNative:node.title?.native||undefined, format:node.format||undefined, type:node.format||undefined, episodes:node.episodes??undefined, duration:node.duration??undefined, status:node.status||undefined, averageScore:node.averageScore??undefined, popularity:node.popularity||0, coverImage:node.coverImage||undefined, genres:node.genres||[], description:node.description||undefined, trailer:node.trailer||null, relationType:relType||undefined, sourceId:src, depth, year:node.startDate?.year||undefined } as any;
}
export interface BuildGraphParams{ title:string; anilistId?:number; malId?:number; scope:"season"|"franchise"; maxDepth?:number; }
export async function buildRelationGraph(params:BuildGraphParams){
  const warnings:string[]=[]; const maxDepth=params.maxDepth??(params.scope==="franchise"?4:0);
  const nodes=new Map<number,RawRelationNode>(); const edges:Array<{from:number;to:number;type:string}>=[]; const visited=new Set<number>(); const queue:Array<{id:number;depth:number}>=[]; let root:RawRelationNode|null=null;
  if(params.anilistId){ const m=await fetchAniListMedia(params.anilistId); if(m && isAnimeFormat(m.format)){ root=anilistToRaw(m,0); nodes.set(root.anilistId,root); visited.add(root.anilistId); queue.push({id:root.anilistId,depth:0}); } }
  if(!root){ const results=await searchAniListForGraph(params.title,5); if(results.length===0) throw new Error(`No anime found for "${params.title}" — try a simpler title like "${sanitizeForSearch(params.title)[1]||params.title.split(/\s+/)[0]}"`);
    const best = selectBestAnimeMatch(params.title, results);
    root = anilistToRaw(best,0);
    nodes.set(root.anilistId,root);
    visited.add(root.anilistId);
    queue.push({id:root.anilistId,depth:0}); }
  while(queue.length>0){ const cur=queue.shift()!; if(cur.depth>=maxDepth) continue; const media=await fetchAniListMedia(cur.id); if(!media?.relations?.edges) continue; for(const e of media.relations.edges){ const rn=e.node; if(!rn?.id) continue; if(!isAnimeFormat(rn.format)){ warnings.push(`Skipped non-anime ${rn.format}: ${rn.title?.romaji}`); continue; } const tl=(rn.title?.romaji||"").toLowerCase(); if(tl.includes("chapter 1:")&&tl.includes("day in the capital")){ warnings.push(`Skipped manga ${tl}`); continue; } if(tl.includes("chapter 2:")&&tl.includes("week at the mansion")){ warnings.push(`Skipped manga ${tl}`); continue; } if(visited.has(rn.id)){ edges.push({from:cur.id,to:rn.id,type:e.relationType||"unknown"}); continue; } if((rn.format||"").toUpperCase()==="MUSIC") continue; const raw=anilistToRaw(rn,cur.depth+1,e.relationType,cur.id); nodes.set(raw.anilistId,raw); edges.push({from:cur.id,to:raw.anilistId,type:e.relationType||"unknown"}); visited.add(raw.anilistId); queue.push({id:raw.anilistId,depth:cur.depth+1}); if(visited.size%3===0) await sleep(350); } }
  if(params.scope==="franchise"){ const stem=extractStem(params.title); if(stem){ const wider=await searchAniListForGraph(stem,30); for(const it of wider){ if(!it.id||visited.has(it.id)) continue; if(!isAnimeFormat(it.format)) continue; const tl=(it.title?.romaji||it.title?.english||"").toLowerCase(); if(tl.includes("chapter 1")&&tl.includes("capital")) continue; if(tl.includes("chapter 2")&&tl.includes("mansion")) continue; if((it.popularity||0)<500 && wider.length>20) continue; const titleScore = scoreTitleMatch(params.title, it); if(titleScore < 35) continue; const raw=anilistToRaw(it,1,"wider_search"); nodes.set(raw.anilistId,raw); edges.push({from:root.anilistId,to:raw.anilistId,type:"wider_search"}); visited.add(raw.anilistId); } } }
  const allowed=Array.from(nodes.values()).filter(n=>isAnimeFormat(n.format as any)).filter(n=>{ const t=(n.title||"").toLowerCase(); if(t.includes("chapter 1: a day in the capital")) return false; if(t.includes("chapter 2: a week at the mansion")) return false; return true; }).map(node=>{ const aliases=[node.titleEnglish||"",node.titleRomaji||"",node.titleNative||"",node.title||""].filter(Boolean) as string[]; const norm=normalizeTitle(node.title); return { id:`ani_${node.anilistId}`, anilistId:node.anilistId, malId:node.malId, title:node.title, normalizedTitle:norm, aliases:Array.from(new Set(aliases)), format:parseFormat(node.format,node.type), episodes:node.episodes, duration:node.duration, year:(node as any).year, popularity:node.popularity||0, relationType:node.relationType, isMainEntry:node.depth===0 }; });
  allowed.sort((a,b)=>{ const na=nodes.get(a.anilistId); const nb=nodes.get(b.anilistId); const d=(na?.depth||0)-(nb?.depth||0); if(d!==0) return d; return (b.popularity||0)-(a.popularity||0); });
  const graph={ root:root!, nodes, edges, totalDiscovered:nodes.size, maxDepth }; return { graph, allowedTitles:allowed, root:root!, warnings };
}
function extractStem(t:string):string|null{
  const l=t.toLowerCase().trim();
  const knownFranchises = [
    "fate",
    "monogatari",
    "gundam",
    "jojo",
    "re:zero",
    "rezero",
    "gintama",
    "naruto",
    "bleach",
    "one piece",
    "dragon ball",
  ];
  for (const stem of knownFranchises) {
    if (l.includes(stem)) return stem;
  }
  const words = l.split(/\s+/).filter(Boolean);
  if (words.length === 1 && words[0].length >= 6) {
    return words[0];
  }
  return null;
}
export function findAllowedTitleById(a:any[],id:string|number){ const s=String(id); return a.find(x=>x.id===s||String(x.anilistId)===s||(x.malId&&String(x.malId)===s)); }
export function findAllowedTitleByFuzzy(a:any[],q:string){ const n=normalizeTitle(q); return a.find(x=>x.normalizedTitle===n||x.aliases.some((al:string)=>normalizeTitle(al)===n)||x.normalizedTitle.includes(n)||n.includes(x.normalizedTitle)); }
