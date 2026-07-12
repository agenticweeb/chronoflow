
import { AnimeSearchResult, EnrichmentData, Relation } from "@/types";
const BASE_URL = "https://api.jikan.moe/v4";
let lastRequestTime = 0; const MIN_INTERVAL = 350;
async function sleep(ms:number){ return new Promise(r=>setTimeout(r,ms)); }
async function rateLimitedFetch(url: string, retries=3): Promise<Response> {
  for(let attempt=0; attempt<=retries; attempt++){
    const now=Date.now(); const wait=Math.max(0, MIN_INTERVAL - (now-lastRequestTime));
    if(wait>0) await sleep(wait); lastRequestTime=Date.now();
    try{
      const res=await fetch(url);
      if(res.ok) return res;
      if(res.status===429){
        const retryAfter = Number(res.headers.get("Retry-After")||"1")*1000;
        const backoff = Math.min(retryAfter || 1000*Math.pow(2,attempt), 8000);
        console.warn(`Jikan 429 retry ${attempt+1} after ${backoff}ms for ${url}`);
        await sleep(backoff); continue;
      }
      if(res.status>=500 && attempt<retries){ await sleep(500*(attempt+1)); continue; }
      return res;
    }catch(e){ if(attempt===retries) throw e; await sleep(400*(attempt+1)); }
  }
  throw new Error("Jikan fetch failed after retries");
}
export async function searchAnime(query: string, limit=10): Promise<AnimeSearchResult[]>{
  const url=`${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=${limit}&order_by=popularity&sort=asc`;
  const res=await rateLimitedFetch(url); if(!res.ok) throw new Error(`Jikan search failed: ${res.status}`);
  const data=await res.json();
  return data.data.map((item:any)=>({ malId:item.mal_id, title:item.title, titleJapanese:item.title_japanese, imageUrl:item.images?.jpg?.image_url||item.images?.webp?.image_url||"", type:item.type, episodes:item.episodes, score:item.score||0, synopsis:item.synopsis||"", genres:item.genres?.map((g:any)=>g.name)||[], aired:item.aired?.string, status:item.status, isFranchise:false }));
}
export async function getAnimeDetails(malId:number): Promise<EnrichmentData>{
  const [animeRes, relationsRes]=await Promise.all([rateLimitedFetch(`${BASE_URL}/anime/${malId}/full`), rateLimitedFetch(`${BASE_URL}/anime/${malId}/relations`)]);
  if(!animeRes.ok) throw new Error(`Jikan details failed: ${animeRes.status}`);
  const anime=(await animeRes.json()).data; const relations=relationsRes.ok ? (await relationsRes.json()).data : [];
  return { malId:anime.mal_id, score:anime.score||0, popularity:anime.popularity||0, members:anime.members||0, synopsis:anime.synopsis||"", genres:anime.genres?.map((g:any)=>g.name)||[], studios:anime.studios?.map((s:any)=>s.name)||[], aired:anime.aired?.string||"", duration:anime.duration||"", rating:anime.rating||"", imageUrl:anime.images?.jpg?.large_image_url||anime.images?.jpg?.image_url||"", trailerUrl:anime.trailer?.url||anime.trailer?.embed_url, relations:relations.map((r:any)=>({ relation:r.relation, entry:{ malId:r.entry?.[0]?.mal_id, type:r.entry?.[0]?.type, title:r.entry?.[0]?.name } })) };
}
export async function getFranchiseEntries(malId:number): Promise<EnrichmentData[]>{
  const details=await getAnimeDetails(malId); const franchiseIds=new Set<number>();
  details.relations.forEach((r:Relation)=>{ if(r.entry?.malId) franchiseIds.add(r.entry.malId); });
  const entries:EnrichmentData[]=[]; for(const id of Array.from(franchiseIds)){ try{ const entry=await getAnimeDetails(id); entries.push(entry);}catch(e){ console.warn(`Failed to fetch franchise entry ${id}:`,e);} } return entries;
}
