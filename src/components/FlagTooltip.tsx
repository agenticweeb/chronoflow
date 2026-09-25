import { GitBranch } from "lucide-react";

interface FlagTooltipProps {
  flag: string;
}

export function FlagTooltip({ flag }: FlagTooltipProps) {
  let message = "Anomaly detected in timeline structure.";

  if (flag.startsWith("different-studio")) {
    const parts = flag.split(":");
    if (parts.length === 3) {
      const rootStudio = parts[1];
      const nodeStudio = parts[2];
      message = `Visual profile shift: Animation studio changed from ${rootStudio} to ${nodeStudio}.`;
    } else {
      message = "Visual profile shift detected due to production studio relocation.";
    }
  }

  return (
    <div className="group relative inline-flex items-center ml-2 cursor-help align-middle">
      <GitBranch className="w-3.5 h-3.5 text-amber-400/70" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-200 whitespace-nowrap z-[9999] shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {message}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
}
