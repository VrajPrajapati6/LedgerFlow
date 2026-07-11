"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  accountService,
  transactionService,
  ledgerService,
  fraudService,
} from "@/services/api/endpoints";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  accent?: "blue" | "emerald" | "amber" | "red" | "violet";
}

function KPICard({
  title,
  value,
  description,
  trend = "neutral",
  trendLabel,
  accent = "blue",
}: KPICardProps) {
  const accentMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    red: "bg-red-50 text-red-600 border-red-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
      ? "text-red-500"
      : "text-slate-400";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {title}
        </p>
        {trendLabel && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-semibold",
              trendColor
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {trendLabel}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
        {value}
      </p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}

export function KPICards() {
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionService.list,
  });
  const { data: ledger = [] } = useQuery({
    queryKey: ["ledger"],
    queryFn: ledgerService.list,
  });
  const { data: fraudAlerts = [] } = useQuery({
    queryKey: ["fraudAlerts"],
    queryFn: fraudService.listAlerts,
  });

  const successTxs = transactions.filter((t) => t.status === "SUCCESS");
  const totalVolume = successTxs.reduce((s, t) => s + (t.amount || 0), 0);
  const highRisk = fraudAlerts.filter((a) => a.severity === "HIGH").length;

  const kpis: KPICardProps[] = [
    {
      title: "Total Accounts",
      value: accounts.length,
      description: "Active ledger containers",
      trend: "up",
      trendLabel: "+2 this week",
      accent: "blue",
    },
    {
      title: "Transactions",
      value: transactions.length,
      description: "Total transfer records",
      trend: "up",
      trendLabel: `${successTxs.length} succeeded`,
      accent: "emerald",
    },
    {
      title: "Ledger Volume",
      value: `$${totalVolume.toLocaleString()}`,
      description: "Cumulative cleared amount",
      trend: "up",
      trendLabel: "USD",
      accent: "violet",
    },
    {
      title: "Ledger Entries",
      value: ledger.length,
      description: "Immutable event records",
      trend: "neutral",
      accent: "blue",
    },
    {
      title: "Fraud Alerts",
      value: fraudAlerts.length,
      description: `${highRisk} high severity`,
      trend: highRisk > 0 ? "down" : "neutral",
      trendLabel: highRisk > 0 ? `${highRisk} critical` : "All clear",
      accent: highRisk > 0 ? "red" : "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <KPICard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
