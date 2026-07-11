import * as React from "react";
import { Info, FolderSearch } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400">
        <FolderSearch className="h-6 w-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-500 leading-normal">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function NoData({
  message = "No telemetry logs recorded.",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center gap-2 p-4 text-xs font-mono text-slate-500 border border-slate-900 bg-slate-950/50 rounded-lg">
      <Info className="h-4 w-4 text-slate-600 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
