"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ledgerService } from "@/services/api/endpoints";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LedgerTimeline() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["ledger"],
    queryFn: ledgerService.list,
  });

  const recent = [...entries]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 8);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Ledger Timeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">Recent double-entry events</p>
        </div>
        <Link
          href="/ledger"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
        >
          Explorer <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-4 w-4 bg-slate-100 rounded-full mt-1 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-slate-400 gap-2">
          <TrendingUp className="h-8 w-8 text-slate-300" />
          <p className="text-xs">No ledger entries yet</p>
        </div>
      ) : (
        <div className="relative pl-4">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />

          <div className="space-y-4">
            {recent.map((entry, idx) => (
              <div key={entry.id} className="relative flex gap-3">
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute -left-4 top-1 h-3 w-3 rounded-full border-2 border-white shrink-0",
                    entry.entryType === "CREDIT"
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          entry.entryType === "CREDIT"
                            ? "text-emerald-600"
                            : "text-red-600"
                        )}
                      >
                        {entry.entryType}
                      </span>
                      <p className="text-xs text-slate-700 mt-0.5 truncate">
                        {entry.description || "Ledger adjustment"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        acct: {entry.accountId.slice(0, 8)}…
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-900 tabular-nums">
                        ${Number(entry.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
