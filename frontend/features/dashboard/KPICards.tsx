"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Landmark,
  ArrowLeftRight,
  ScrollText,
  DollarSign,
  ShieldAlert,
  GitCompare,
  Camera,
  HeartPulse,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface KPICardsProps {
  stats: {
    totalAccounts: number;
    totalTransactions: number;
    totalLedgerEntries: number;
    systemBalance: number;
    fraudAlerts: number;
    failedReconciliations: number;
    snapshotsCount: number;
    systemHealth: string;
  };
}

export function KPICards({ stats }: KPICardsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      title: "Total Accounts",
      value: stats.totalAccounts,
      description: "Provisioned user containers",
      icon: Landmark,
      iconColor: "text-blue-500",
      trend: "+12% MoM",
      trendUp: true,
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions,
      description: "Atomic transfer requests",
      icon: ArrowLeftRight,
      iconColor: "text-blue-500",
      trend: "+8% WoW",
      trendUp: true,
    },
    {
      title: "Ledger Entries",
      value: stats.totalLedgerEntries,
      description: "Double-entry events log",
      icon: ScrollText,
      iconColor: "text-indigo-500",
      trend: "+18% WoW",
      trendUp: true,
    },
    {
      title: "System Balance",
      value: formatCurrency(stats.systemBalance),
      description: "Aggregated active capital",
      icon: DollarSign,
      iconColor: "text-emerald-500",
      trend: "+4.2% inflows",
      trendUp: true,
    },
    {
      title: "Fraud Alerts",
      value: stats.fraudAlerts,
      description: "Flagged transactions limit",
      icon: ShieldAlert,
      iconColor: stats.fraudAlerts > 0 ? "text-rose-500" : "text-slate-500",
      trend: stats.fraudAlerts > 0 ? "Needs Review" : "0 alerts triggered",
      trendUp: stats.fraudAlerts > 0 ? false : undefined,
    },
    {
      title: "Failed Reconciliations",
      value: stats.failedReconciliations,
      description: "Discrepancy audit matches",
      icon: GitCompare,
      iconColor:
        stats.failedReconciliations > 0 ? "text-amber-500" : "text-slate-500",
      trend:
        stats.failedReconciliations > 0
          ? "Unsettled anomalies"
          : "100% matched",
      trendUp: stats.failedReconciliations > 0 ? false : undefined,
    },
    {
      title: "Active Snapshots",
      value: stats.snapshotsCount,
      description: "Accelerated state checkpoints",
      icon: Camera,
      iconColor: "text-indigo-400",
      trend: "Replay steps saved",
      trendUp: true,
    },
    {
      title: "System Health",
      value: stats.systemHealth,
      description: "Nodes and infrastructure",
      icon: HeartPulse,
      iconColor:
        stats.systemHealth === "Operational"
          ? "text-emerald-500"
          : "text-amber-500",
      trend: "Latency: <10ms",
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 select-none">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.title}
            className="bg-slate-950 border-slate-900 hover:border-slate-800 transition-colors"
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  {c.title}
                </span>
                <div className={`p-1.5 rounded bg-slate-900 border border-slate-800`}>
                  <Icon className={`h-4 w-4 ${c.iconColor}`} />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl font-bold text-white tracking-tight font-mono">
                  {c.value}
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {c.description}
                </p>
              </div>
              {c.trend !== undefined && (
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  {c.trendUp === true ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : c.trendUp === false ? (
                    <TrendingDown className="h-3 w-3 text-rose-500" />
                  ) : null}
                  <span
                    className={
                      c.trendUp === true
                        ? "text-emerald-500"
                        : c.trendUp === false
                        ? "text-rose-500"
                        : "text-slate-400"
                    }
                  >
                    {c.trend}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
