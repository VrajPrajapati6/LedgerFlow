import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin text-blue-600", className)} />
  );
}

export function PageLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-100 rounded-md" />
          <div className="h-4 w-64 bg-slate-100 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-slate-100 rounded-md" />
          <div className="h-9 w-28 bg-slate-100 rounded-md" />
        </div>
      </div>
      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Table skeleton */}
      <SkeletonTable />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 animate-pulse card-shadow">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-slate-100 rounded" />
        <div className="h-8 w-8 bg-slate-100 rounded-lg" />
      </div>
      <div className="h-7 w-2/3 bg-slate-100 rounded-md" />
      <div className="h-3 w-1/2 bg-slate-100 rounded" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-pulse card-shadow">
      <div className="h-11 bg-slate-50 border-b border-slate-100 px-4 flex items-center gap-4">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="h-3 w-32 bg-slate-200 rounded" />
        <div className="h-3 w-20 bg-slate-200 rounded" />
        <div className="h-3 w-28 bg-slate-200 rounded" />
      </div>
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <div className="h-3.5 flex-1 bg-slate-100 rounded" />
            <div className="h-3.5 flex-1 bg-slate-100 rounded" />
            <div className="h-3.5 w-24 bg-slate-100 rounded" />
            <div className="h-5 w-16 bg-slate-100 rounded-full" />
            <div className="h-3.5 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 animate-pulse card-shadow">
      <div className="flex items-center justify-between">
        <div className="h-4 w-36 bg-slate-100 rounded" />
        <div className="h-4 w-16 bg-slate-100 rounded" />
      </div>
      <div className="h-48 bg-slate-50 rounded-lg border border-slate-100" />
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
