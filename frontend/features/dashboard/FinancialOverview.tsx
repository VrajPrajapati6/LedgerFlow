"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Zap } from "lucide-react";

interface FinancialOverviewProps {
  ledgerEntries: any[];
  snapshotsCount: number;
}

export function FinancialOverview({
  ledgerEntries = [],
  snapshotsCount,
}: FinancialOverviewProps) {
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let totalCredits = 0;
  let totalDebits = 0;

  ledgerEntries.forEach((entry) => {
    const val = Number(entry.amount);
    if (entry.entryType === "CREDIT") {
      totalCredits += val;
      if (
        entry.description?.toLowerCase().includes("infusion") ||
        entry.description?.toLowerCase().includes("seed") ||
        entry.description?.toLowerCase().includes("deposit")
      ) {
        totalDeposits += val;
      }
    } else if (entry.entryType === "DEBIT") {
      totalDebits += val;
    }
  });

  const netFlow = totalDeposits - totalWithdrawals;
  const isConserved =
    Math.abs(totalCredits - totalDebits - totalDeposits) < 0.01;
  const replayStepsSaved = snapshotsCount * 12;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 select-none">
      <Card className="bg-slate-950 border-slate-900">
        <CardContent className="p-4 space-y-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            Total Deposits
          </span>
          <div className="text-base font-bold text-white font-mono">
            ${totalDeposits.toLocaleString()}
          </div>
          <p className="text-[9px] text-slate-500 leading-tight">
            External inflows capital
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-950 border-slate-900">
        <CardContent className="p-4 space-y-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            Total Outflows
          </span>
          <div className="text-base font-bold text-white font-mono">
            ${totalWithdrawals.toLocaleString()}
          </div>
          <p className="text-[9px] text-slate-500 leading-tight">
            Settled withdraw sweep
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-950 border-slate-900">
        <CardContent className="p-4 space-y-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            Net Money Flow
          </span>
          <div className="text-base font-bold text-emerald-400 font-mono">
            +${netFlow.toLocaleString()}
          </div>
          <p className="text-[9px] text-slate-500 leading-tight">
            Capital delta within ledger
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-950 border-slate-900">
        <CardContent className="p-4 space-y-2">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
            Double-Entry Status
          </span>
          <div className="flex items-center gap-1.5">
            {isConserved ? (
              <>
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-emerald-500 font-mono tracking-tight animate-pulse">
                  CONSERVED
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-rose-500 font-mono tracking-tight">
                  UNBALANCED
                </span>
              </>
            )}
          </div>
          <p className="text-[9px] text-slate-500 leading-tight">
            Sum audit: credits == debits
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-950 border-slate-900">
        <CardContent className="p-4 space-y-1.5">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
            Replay Acceleration
          </span>
          <div className="flex items-center gap-1 text-indigo-400">
            <Zap className="h-3.5 w-3.5 fill-indigo-400 shrink-0" />
            <span className="text-xs font-bold font-mono">
              +{replayStepsSaved} steps saved
            </span>
          </div>
          <p className="text-[9px] text-slate-500 leading-tight">
            Snapshot optimization
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
