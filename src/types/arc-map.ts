export interface ArcEpisodeRange {
  mediaId: number;
  startEpisode: number;
  endEpisode: number;
}

export type ArcImportance = 'core' | 'recommended' | 'skippable';

export interface CuratedArc {
  id: string;
  name: string;
  shortName?: string;
  order: number;
  ranges: ArcEpisodeRange[];
  importance?: ArcImportance;
}

export interface FranchiseArcMap {
  rootAnilistId: number;
  franchiseName: string;
  primaryMediaIds: number[];
  arcs: CuratedArc[];
  version: number;
  updatedAt: string;
}
