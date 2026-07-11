"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ledgerService,
  snapshotService,
  fraudService,
  reconciliationService,
} from "@/services/api/endpoints";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  GitCompare,
  Camera,
  Layers,
} from "lucide-react";

export function LedgerTimelineChart() {
  const { data: ledger = [] } = useQuery({
    queryKey: ["ledger"],
    queryFn: ledgerService.list,
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["snapshots"],
    queryFn: snapshotService.list,
  });

  const { data: fraudAlerts = [] } = useQuery({
    queryKey: ["fraudAlerts"],
    queryFn: fraudService.listAlerts,
  });

  const { data: reconReport = null } = useQuery({
    queryKey: ["reconciliationReport"],
    queryFn: async () => {
      try {
        return await reconciliationService.getReport();
      } catch {
        return null;
      }
    },
  });

  const timelineItems = React.useMemo(() => {
    const items: any[] = [];

    ledger.forEach((e) => {
      items.push({
        id: `ledger-${e.id}`,
        type: e.entryType === "CREDIT" ? "credit" : "debit",
        title: e.entryType === "CREDIT" ? "Credit Flow Event" : "Debit Flow Event",
        description: e.description || `${e.entryType} of $${Number(e.amount)}`,
        timestamp: new Date(e.createdAt).getTime(),
      });
    });

    snapshots.forEach((s) => {
      items.push({
        id: `snap-${s.id}`,
        type: "snapshot",
        title: "Snapshot State Checkpoint",
        description: `Account checkpoint snapshot saved at $${Number(s.balance)}`,
        timestamp: new Date(s.createdAt).getTime(),
      });
    });

    fraudAlerts.forEach((a) => {
      items.push({
        id: `fraud-${a.id}`,
        type: "fraud",
        title: "Risk Scan Telemetry Alert",
        description: `Flagged suspicious risk rating score: ${a.riskScore} (${a.severity})`,
        timestamp: new Date(a.createdAt).getTime(),
      });
    });

    if (reconReport) {
      items.push({
        id: `recon-${reconReport.runId}`,
        type: "reconciliation",
        title: "Audit Recon Scan Completed",
        description: `Matched: ${reconReport.totalMatched}, anomalies: ${reconReport.totalMismatched}`,
        timestamp: new Date(reconReport.createdAt).getTime(),
      });
    }

    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  }, [ledger, snapshots, fraudAlerts, reconReport]);

  return (
    <Card className="bg-slate-950 border-slate-900 select-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-blue-500" />
          Event Sourcing Activity Stream (Chronological)
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3">
        {timelineItems.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono italic text-center py-8">
            No system log streams captured yet.
          </p>
        ) : (
          <div className="relative pl-4 border-l border-slate-800 space-y-4 my-2">
            {timelineItems.map((item) => {
              let Icon = ArrowUpRight;
              let colorClasses = "bg-blue-500/10 text-blue-400 border-blue-500/20";

              if (item.type === "credit") {
                Icon = ArrowDownLeft;
                colorClasses =
                  "bg-emerald-500/10 text-emerald-405 border-emerald-500/20";
              } else if (item.type === "debit") {
                Icon = ArrowUpRight;
                colorClasses = "bg-rose-500/10 text-rose-450 border-rose-500/20";
              } else if (item.type === "snapshot") {
                Icon = Camera;
                colorClasses = "bg-blue-600/10 text-blue-400 border-blue-600/20";
              } else if (item.type === "fraud") {
                Icon = ShieldAlert;
                colorClasses = "bg-amber-500/10 text-amber-450 border-amber-500/20";
              } else if (item.type === "reconciliation") {
                Icon = GitCompare;
                colorClasses =
                  "bg-purple-500/10 text-purple-400 border-purple-500/20";
              }

              return (
                <div key={item.id} className="relative space-y-0.5">
                  <span
                    className={`absolute -left-[24px] top-0.5 flex items-center justify-center h-4.5 w-4.5 rounded-full border ${colorClasses}`}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                    <span className="font-semibold text-slate-350">
                      {item.title}
                    </span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-tight">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
