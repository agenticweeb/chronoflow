export interface FranchiseDNA {
  nonLinearity: number;
  entryClarity: number;
  density: number;
  sequelDepth: number;
  branchFactor: number;
  computedAt: string;
}

export function computeDNA(watchOrder: {
  totalEntries?: number;
  allEntriesFlat?: Array<{ tier: string }>;
  paths?: Array<{ groups?: Array<any> }>;
}): FranchiseDNA {
  const entries = watchOrder.allEntriesFlat || [];
  const totalEntries = entries.length || watchOrder.totalEntries || 0;
  
  if (totalEntries === 0) {
    return { nonLinearity: 0, entryClarity: 0, density: 0, sequelDepth: 0, branchFactor: 0, computedAt: new Date().toISOString() };
  }

  const groupCount = watchOrder.paths?.reduce((acc, p) => acc + (p.groups?.length || 0), 0) || 1;
  const pathCount = watchOrder.paths?.length || 1;
  const nonLinearity = Math.min(10, Math.round((groupCount / 3) + (pathCount - 1) * 2));
  const entryClarity = Math.max(2, 10 - (pathCount * 3));
  const essentialCount = entries.filter(e => e.tier === "essential").length;
  const density = Math.min(10, Math.round((essentialCount / totalEntries) * 10));
  const sequelDepth = Math.min(10, Math.round(totalEntries / groupCount));
  const branchFactor = Math.min(10, Math.round(totalEntries / 5));

  return { nonLinearity, entryClarity, density, sequelDepth, branchFactor, computedAt: new Date().toISOString() };
}
