"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  accountService,
  transactionService,
  snapshotService,
  ledgerService,
} from "@/services/api/endpoints";
import { ArrowUpRight, Server, Database, Zap, Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SystemHealthCards() {
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionService.list,
  });
  const { data: snapshots = [] } = useQuery({
    queryKey: ["snapshots"],
    queryFn: snapshotService.list,
  });
  const { data: ledger = [] } = useQuery({
    queryKey: ["ledger"],
    queryFn: ledgerService.list,
  });

  const metrics = [
    {
      icon: Server,
      label: "API Gateway",
      status: "Operational",
      dot: "bg-emerald-400",
      desc: "All endpoints healthy",
      color: "text-emerald-600",
    },
    {
      icon: Database,
      label: "Ledger Engine",
      status: `${ledger.length} events`,
      dot: "bg-emerald-400",
      desc: "Event store reachable",
      color: "text-emerald-600",
    },
    {
      icon: Zap,
      label: "Transaction Bus",
      status: `${transactions.length} records`,
      dot: transactions.length > 0 ? "bg-emerald-400" : "bg-amber-400",
      desc: "Transfer pipeline active",
      color: transactions.length > 0 ? "text-emerald-600" : "text-amber-600",
    },
    {
      icon: Activity,
      label: "Snapshot Store",
      status: `${snapshots.length} checkpoints`,
      dot: "bg-emerald-400",
      desc: "Checkpoints persisted",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">System Health</h2>
          <p className="text-xs text-slate-500 mt-0.5">Infrastructure service status</p>
        </div>
        <Link
          href="/system-health"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
        >
          Details <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100"
            >
              <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900">{m.label}</p>
                <p className="text-[10px] text-slate-400 truncate">{m.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={cn("h-2 w-2 rounded-full", m.dot)} />
                <span className={cn("text-[10px] font-semibold", m.color)}>
                  {m.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
