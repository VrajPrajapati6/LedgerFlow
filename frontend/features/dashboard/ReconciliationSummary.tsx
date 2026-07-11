"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { reconciliationService } from "@/services/api/endpoints";
import { GitCompare, CheckCircle2, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function ReconciliationSummary() {
  const { data: report, isLoading } = useQuery({
    queryKey: ["reconciliationReport"],
    queryFn: reconciliationService.getReport,
  });

  const total = report
    ? report.totalMatched + report.totalMismatched
    : 0;
  const matchRate =
    total > 0 && report
      ? ((report.totalMatched / total) * 100).toFixed(0)
      : "0";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-violet-500" />
          Reconciliation
        </h2>
        <Link
          href="/reconciliation"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
        >
          View <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : !report ? (
        <div className="flex flex-col items-center py-6 text-slate-400 gap-2">
          <GitCompare className="h-8 w-8 text-slate-300" />
          <p className="text-xs">No reconciliation data yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-lg">
            <span className="text-xs text-emerald-700">Matched Records</span>
            <span className="text-xs font-bold text-emerald-700">
              {report.totalMatched}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-lg">
            <span className="text-xs text-red-700">Mismatched Records</span>
            <span className="text-xs font-bold text-red-700">
              {report.totalMismatched}
            </span>
          </div>
          {/* Match rate bar */}
          <div className="pt-1">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Match Rate</span>
              <span className="font-semibold text-slate-700">{matchRate}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${matchRate}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
