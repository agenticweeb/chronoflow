// src/data/loading-narratives.ts

export interface LoadingPhase {
  message: string;
  estimatedMs: number;
  icon?: string;
}

export interface Narrative {
  franchise: string;
  phases: LoadingPhase[];
}

export const loadingNarratives: Record<string, Narrative> = {
  fate: {
    franchise: 'Fate',
    phases: [
      { message: 'Querying AniList for Nasuverse relations...', estimatedMs: 2000, icon: '🔮' },
      { message: 'Mapping 847 timeline edges across parallel universes...', estimatedMs: 3500, icon: '🕸️' },
      { message: 'Traversing the visual novel adaptation tree...', estimatedMs: 4000, icon: '🌳' },
      { message: 'Resolving chronological vs. release order conflicts...', estimatedMs: 3000, icon: '⚔️' },
      { message: "AI classifying Heaven's Feel trilogy as Essential...", estimatedMs: 2500, icon: '⭐' },
      { message: 'Finalizing your 30-entry Nasuverse guide...', estimatedMs: 2000, icon: '✨' },
    ],
  },
  monogatari: {
    franchise: 'Monogatari',
    phases: [
      { message: "Unraveling Nisio Isin's non-linear narrative web...", estimatedMs: 2500, icon: '🕷️' },
      { message: 'Mapping 38 entries across 15 story arcs...', estimatedMs: 3500, icon: '📚' },
      { message: 'Resolving broadcast order vs. chronological order...', estimatedMs: 3000, icon: '🔄' },
      { message: 'AI classifying Kizumonogatari placement...', estimatedMs: 2500, icon: '🦇' },
      { message: 'Finalizing your Monogatari expedition map...', estimatedMs: 2000, icon: '🗺️' },
    ],
  },
  default: {
    franchise: 'Anime Universe',
    phases: [
      { message: 'Querying AniList for franchise relations...', estimatedMs: 2500, icon: '🔍' },
      { message: 'Mapping timeline connections...', estimatedMs: 3500, icon: '🗺️' },
      { message: 'Analyzing narrative structure...', estimatedMs: 3000, icon: '🧠' },
      { message: 'AI classifying watch priority tiers...', estimatedMs: 2500, icon: '⚖️' },
      { message: 'Finalizing your personalized watch order...', estimatedMs: 2000, icon: '✅' },
    ],
  },
};

export function getNarrative(franchiseQuery: string): Narrative {
  if (!franchiseQuery) return loadingNarratives.default;
  const normalized = franchiseQuery.toLowerCase();
  const key = Object.keys(loadingNarratives).find(k => 
    normalized.includes(k) || k.includes(normalized)
  ) ?? 'default';
  return loadingNarratives[key];
}
