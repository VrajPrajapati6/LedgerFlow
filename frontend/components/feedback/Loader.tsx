import * as React from "react";
import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={`h-4 w-4 animate-spin text-blue-500 ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-8 w-8" />
        <span className="text-xs text-slate-500 font-mono">
          Loading data telemetry...
        </span>
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-10 w-10" />
        <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">
          Initializing LedgerFlow Console
        </span>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-900 bg-slate-950 p-6 space-y-4 animate-pulse">
      <div className="h-4 w-1/3 bg-slate-900 rounded" />
      <div className="h-8 w-2/3 bg-slate-900 rounded" />
      <div className="h-3 w-1/2 bg-slate-900 rounded" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="border border-slate-900 rounded-xl bg-slate-950 overflow-hidden animate-pulse">
      <div className="h-10 bg-slate-900 border-b border-slate-900/50" />
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 flex-1 bg-slate-900 rounded" />
            <div className="h-4 flex-1 bg-slate-900 rounded" />
            <div className="h-4 flex-1 bg-slate-900 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
