export interface EraOption {
  label: string;
  startDateGreater: number;
  startDateLesser: number;
}

export const ERA_OPTIONS: EraOption[] = [
  { label: "All Time", startDateGreater: 0, startDateLesser: 99991231 },
  { label: "2020s", startDateGreater: 20200101, startDateLesser: 20291231 },
  { label: "2010s", startDateGreater: 20100101, startDateLesser: 20191231 },
  { label: "2000s", startDateGreater: 20000101, startDateLesser: 20091231 },
  { label: "1990s", startDateGreater: 19900101, startDateLesser: 19991231 },
  { label: "1980s", startDateGreater: 19800101, startDateLesser: 19891231 },
  { label: "Classic (Pre-1980)", startDateGreater: 0, startDateLesser: 19791231 },
];

export function getEraDates(label: string): { startDateGreater: number; startDateLesser: number } {
  const era = ERA_OPTIONS.find(e => e.label === label);
  return era ?? ERA_OPTIONS[0];
}
