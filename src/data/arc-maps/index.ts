import { onePieceArcMap } from './one-piece';
import { narutoArcMap } from './naruto';
import { shippudenArcMap } from './naruto-shippuden';
import { bleachArcMap } from './bleach';
import type { FranchiseArcMap } from '@/types/arc-map';

const ARC_MAP_REGISTRY: Record<number, FranchiseArcMap> = {
  21: onePieceArcMap,
  20: narutoArcMap,
  1735: shippudenArcMap, // VERIFY: Shippuden AniList ID once API is back
  269: bleachArcMap,
};

export function getCuratedArcMap(rootAnilistId: number): FranchiseArcMap | null {
  return ARC_MAP_REGISTRY[rootAnilistId] || null;
}
