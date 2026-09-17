import { onePieceArcMap } from './one-piece';
import { narutoArcMap } from './naruto';
import { shippudenArcMap } from './naruto-shippuden';
import { bleachArcMap } from './bleach';
import { dragonBallArcMap } from './dragon-ball';
import { dragonBallZArcMap } from './dragon-ball-z';
import { dragonBallGTArcMap } from './dragon-ball-gt';
import { dragonBallSuperArcMap } from './dragon-ball-super';
import { gintamaArcMap } from './gintama';
import { gintamaPrimeArcMap } from './gintama-prime';
import { gintamaDegreesArcMap } from './gintama-degrees';
import { fairyTailArcMap } from './fairy-tail';
import { detectiveConanArcMap } from './detective-conan';
import type { FranchiseArcMap } from '@/types/arc-map';

const ARC_MAP_REGISTRY: Record<number, FranchiseArcMap> = {
  21: onePieceArcMap,
  20: narutoArcMap,
  1735: shippudenArcMap, // VERIFIED via curl (idMal 1735 → NARUTO: Shippuuden, 500 eps)
  269: bleachArcMap,
  223: dragonBallArcMap,
  813: dragonBallZArcMap,
  225: dragonBallGTArcMap,
  21175: dragonBallSuperArcMap,
  918: gintamaArcMap,
  9969: gintamaPrimeArcMap,
  20996: gintamaDegreesArcMap,
  6702: fairyTailArcMap,
  235: detectiveConanArcMap, // VERIFIED via curl (episodes: null, RELEASING)
};

export function getCuratedArcMap(rootAnilistId: number): FranchiseArcMap | null {
  return ARC_MAP_REGISTRY[rootAnilistId] || null;
}
