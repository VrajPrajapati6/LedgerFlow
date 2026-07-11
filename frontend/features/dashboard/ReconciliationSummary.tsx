"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompare, CheckCircle2, Info } from "lucide-react";
import { ReconciliationReport, ReconciliationFailure } from "@/types";

interface ReconciliationSummaryProps {
  report: ReconciliationReport | null;
  failures: ReconciliationFailure[];
}

export function ReconciliationSummary({
  report,
  failures = [],
}: ReconciliationSummaryProps) {
  const matched = report ? report.totalMatched : 0;
  const mismatched = report ? report.totalMismatched : failures.length;

  const countByType = (type: string) => {
    return failures.filter((f) => f.mismatchType === type).length;
  };

  const missingCount = countByType("MISSING_SETTLEMENT");
  const amountMismatchCount = countByType("AMOUNT_MISMATCH");
  const statusMismatchCount = countByType("STATUS_MISMATCH");
  const duplicateCount = countByType("DUPLICATE_SETTLEMENT");

  const totalActions = matched + mismatched;
  const matchRate =
    totalActions > 0 ? ((matched / totalActions) * 100).toFixed(1) : "100.0";

  return (
    <Card className="bg-slate-950 border-slate-900 select-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <GitCompare className="h-4 w-4 text-blue-500" />
          Reconciliation Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Match Rate Overview */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Match rate accuracy
            </span>
            <div className="text-2xl font-bold text-white font-mono">
              {matchRate}%
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[9px] font-mono text-slate-400 block">
              Matched: {matched}
            </span>
            <span className="text-[9px] font-mono text-rose-400 block font-semibold">
              Anomalies: {mismatched}
            </span>
          </div>
        </div>

        {/* Mismatch breakdown */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Discrepancy Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-900/60">
              <span className="text-slate-400 text-[10px]">Missing</span>
              <span
                className={`font-semibold ${
                  missingCount > 0 ? "text-rose-450 font-bold" : "text-slate-500"
                }`}
              >
                {missingCount}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-900/60">
              <span className="text-slate-400 text-[10px]">Amount Mis</span>
              <span
                className={`font-semibold ${
                  amountMismatchCount > 0
                    ? "text-rose-450 font-bold"
                    : "text-slate-500"
                }`}
              >
                {amountMismatchCount}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-900/60">
              <span className="text-slate-400 text-[10px]">Status Dev</span>
              <span
                className={`font-semibold ${
                  statusMismatchCount > 0
                    ? "text-rose-450 font-bold"
                    : "text-slate-500"
                }`}
              >
                {statusMismatchCount}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-900/60">
              <span className="text-slate-400 text-[10px]">Duplicates</span>
              <span
                className={`font-semibold ${
                  duplicateCount > 0
                    ? "text-rose-450 font-bold"
                    : "text-slate-500"
                }`}
              >
                {duplicateCount}
              </span>
            </div>
          </div>
        </div>

        {/* Latest Run status */}
        <div className="space-y-2 border-t border-slate-900 pt-3">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Latest Audit Scan
          </h4>
          {report ? (
            <div className="flex items-center justify-between text-[11px] bg-slate-900/20 p-2 rounded border border-slate-900/30">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-slate-300 font-mono">Scan Completed</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(report.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] bg-slate-900/10 p-2 rounded border border-slate-900/20">
              <Info className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-slate-400 italic font-mono">
                No scans executed. Run Reconcile.
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
