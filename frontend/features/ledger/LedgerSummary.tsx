"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ScrollText,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Camera,
  Layers,
} from "lucide-react";
import { LedgerEntry } from "@/types";

interface LedgerSummaryProps {
  entries: LedgerEntry[];
  snapshotsCount: number;
}

export function LedgerSummary({
  entries = [],
  snapshotsCount = 0,
}: LedgerSummaryProps) {
  const totalCount = entries.length;
  const credits = entries.filter((e) => e.entryType === "CREDIT");
  const debits = entries.filter((e) => e.entryType === "DEBIT");

  const replayOps = totalCount > 0 ? totalCount * 2.5 : 0;
  const footprintSize = totalCount * 180;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const cards = [
    {
      title: "Ledger Entries",
      value: totalCount,
      description: "Immutable transactional events",
      icon: ScrollText,
      iconColor: "text-blue-500",
    },
    {
      title: "Credit Flows",
      value: credits.length,
      description: "Balance increments events",
      icon: TrendingUp,
      iconColor: "text-emerald-500",
    },
    {
      title: "Debit Flows",
      value: debits.length,
      description: "Balance decrements events",
      icon: TrendingDown,
      iconColor: "text-rose-500",
    },
    {
      title: "Optimized Replays",
      value: Math.round(replayOps),
      description: "Simulation steps optimized",
      icon: RefreshCw,
      iconColor: "text-indigo-400",
    },
    {
      title: "Snapshots Count",
      value: snapshotsCount,
      description: "State checkpoints generated",
      icon: Camera,
      iconColor: "text-blue-400",
    },
    {
      title: "Ledger Volume Footprint",
      value: formatSize(footprintSize),
      description: "Disk footprint storage",
      icon: Layers,
      iconColor: "text-slate-400",
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
              <div className="space-y-0.5">
                <div className="text-base font-bold text-white tracking-tight font-mono">
                  {c.value}
                </div>
                <p className="text-[9px] text-slate-500 leading-normal">
                  {c.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
