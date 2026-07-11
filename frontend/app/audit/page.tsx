"use client";

import * as React from "react";
import { ReplaySimulator } from "@/features/ledger/ReplaySimulator";
import { BalanceInspector } from "@/features/ledger/BalanceInspector";
import { LedgerTimelineChart } from "@/features/ledger/LedgerTimelineChart";
import { ShieldCheck, Layers, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuditExplorerPage() {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 select-none sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans sm:text-3xl">
            Audit Trail Explorer
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            POINT-IN-TIME LEDGER RECONSTRUCTION & VERIFICATION SUITE
          </p>
        </div>
      </div>

      {/* Replay Sim and Balance point-in-time inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReplaySimulator />
        <BalanceInspector />
      </div>

      {/* Color-Coded Event Timeline stream & verification standards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LedgerTimelineChart />
        </div>

        {/* Verification standards metrics card */}
        <Card className="bg-slate-950 border-slate-900 select-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardCheck className="h-4 w-4 text-emerald-500" />
              Auditor Compliance Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs font-mono">
            <div className="flex items-start gap-2.5">
              <span className="h-4 w-4 bg-emerald-500/10 text-emerald-450 rounded border border-emerald-500/20 flex items-center justify-center text-[9px] shrink-0 font-bold">
                ✓
              </span>
              <div className="space-y-0.5">
                <span className="text-slate-200 block font-semibold">Immutable Journal</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  All ledger records are append-only. Zero mutations permitted on history.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="h-4 w-4 bg-emerald-500/10 text-emerald-450 rounded border border-emerald-500/20 flex items-center justify-center text-[9px] shrink-0 font-bold">
                ✓
              </span>
              <div className="space-y-0.5">
                <span className="text-slate-200 block font-semibold">Zero Balance Drift</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Historical point-in-time balance checks match recomputed values dynamically.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="h-4 w-4 bg-emerald-500/10 text-emerald-450 rounded border border-emerald-500/20 flex items-center justify-center text-[9px] shrink-0 font-bold">
                ✓
              </span>
              <div className="space-y-0.5">
                <span className="text-slate-200 block font-semibold">Double-Entry Conservation</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Atomic transfer operations write debit and credit pairs concurrently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
