export interface EraOption {
  label: string;
  startDateGreater: number; // YYYYMMDD
  startDateLesser: number;  // YYYYMMDD
}

export const ERA_OPTIONS: EraOption[] = [
  { label: "All Time", startDateGreater: 0, startDateLesser: 99999999 },
  { label: "2020s", startDateGreater: 20200101, startDateLesser: 20299999 },
  { label: "2010s", startDateGreater: 20100101, startDateLesser: 20199999 },
  { label: "2000s", startDateGreater: 20000101, startDateLesser: 20099999 },
  { label: "1990s", startDateGreater: 19900101, startDateLesser: 19999999 },
  { label: "Classic (Pre-1990)", startDateGreater: 0, startDateLesser: 19899999 },
];

export function getEraDates(label: string): { startDateGreater: number; startDateLesser: number } {
  const era = ERA_OPTIONS.find(e => e.label === label);
  return era ?? { startDateGreater: 0, startDateLesser: 99999999 }; // Default to All Time
}
