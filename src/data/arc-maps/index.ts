import { onePieceArcMap } from './one-piece';
import type { FranchiseArcMap } from '@/types/arc-map';

const ARC_MAP_REGISTRY: Record<number, FranchiseArcMap> = {
  21: onePieceArcMap,
};

export function getCuratedArcMap(rootAnilistId: number): FranchiseArcMap | null {
  return ARC_MAP_REGISTRY[rootAnilistId] || null;
}
