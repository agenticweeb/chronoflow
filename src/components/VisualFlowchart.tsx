/**
 * VisualFlowchart — production surface for V2 nested watch orders.
 * Delegates to the battle-tested FlowchartV2 (paths, groups, progress,
 * trailers, calendar, share, focus-season). Keeps a stable public API
 * for the new InteractiveSearch shell.
 */

"use client";

import FlowchartV2 from "@/components/FlowchartV2";
import type { CustomSchedule, WatchOrderResultV2 } from "@/types/intelligent";

export interface VisualFlowchartProps {
  data: WatchOrderResultV2;
  timeBudget?: string;
  customSchedule?: CustomSchedule;
  onBackFromFocus?: () => void;
}

export function VisualFlowchart({
  data,
  timeBudget = "regular",
  customSchedule,
  onBackFromFocus,
}: VisualFlowchartProps) {
  return (
    <FlowchartV2
      data={data}
      timeBudget={timeBudget}
      customSchedule={customSchedule}
      onBackFromFocus={onBackFromFocus}
    />
  );
}

export default VisualFlowchart;
