"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
  DollarSign,
} from "lucide-react";
import { Transaction } from "@/types";

interface TransactionSummaryProps {
  transactions: Transaction[];
}

export function TransactionSummary({
  transactions = [],
}: TransactionSummaryProps) {
  const totalCount = transactions.length;
  const successful = transactions.filter((t) => t.status === "SUCCESS");
  const failed = transactions.filter((t) => t.status === "FAILED");

  const totalVolume = successful.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0
  );
  const averageTransfer =
    successful.length > 0 ? totalVolume / successful.length : 0;
  const highestTransfer = transactions.reduce(
    (max, curr) => Math.max(max, curr.amount || 0),
    0
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      title: "Total Transactions",
      value: totalCount,
      description: "Aggregated exchange transfers",
      icon: ArrowLeftRight,
      iconColor: "text-blue-500",
      trend: "Telemetry Logs",
    },
    {
      title: "Settled Transfers",
      value: successful.length,
      description: "Successfully balanced credits",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      trend: `${
        totalCount > 0 ? ((successful.length / totalCount) * 100).toFixed(1) : 100
      }% rate`,
    },
    {
      title: "Failed Sweeps",
      value: failed.length,
      description: "Declined or rejected events",
      icon: XCircle,
      iconColor: failed.length > 0 ? "text-rose-500" : "text-slate-500",
      trend: `${
        totalCount > 0 ? ((failed.length / totalCount) * 100).toFixed(1) : 0
      }% rate`,
    },
    {
      title: "Total Volume",
      value: formatCurrency(totalVolume),
      description: "Successfully processed value",
      icon: DollarSign,
      iconColor: "text-emerald-500",
      trend: "Cumulative inflows",
    },
    {
      title: "Average Ticket",
      value: formatCurrency(averageTransfer),
      description: "Average transaction size",
      icon: TrendingUp,
      iconColor: "text-blue-400",
      trend: "Mean ticket size",
    },
    {
      title: "Peak Transaction",
      value: formatCurrency(highestTransfer),
      description: "Highest single transfer",
      icon: Activity,
      iconColor: "text-indigo-400",
      trend: "Max single flow",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 select-none">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.title} className="bg-slate-950 border-slate-900">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  {c.title}
                </span>
                <Icon className={`h-4 w-4 ${c.iconColor}`} />
              </div>
              <div>
                <div className="text-base font-bold text-white tracking-tight font-mono">
                  {c.value}
                </div>
                <p className="text-[9px] text-slate-500 leading-normal">
                  {c.description}
                </p>
              </div>
              <div className="text-[9px] font-mono text-slate-400 border-t border-slate-900 pt-1">
                {c.trend}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
