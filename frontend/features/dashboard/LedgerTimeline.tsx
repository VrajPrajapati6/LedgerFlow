"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  GitCompare,
  Camera,
  Layers,
} from "lucide-react";

interface LedgerTimelineProps {
  ledgerEntries: any[];
  snapshots: any[];
  fraudAlerts: any[];
  reconciliationReport: any | null;
}

export function LedgerTimeline({
  ledgerEntries = [],
  snapshots = [],
  fraudAlerts = [],
  reconciliationReport,
}: LedgerTimelineProps) {
  const getTimelineItems = () => {
    const items: any[] = [];

    ledgerEntries.forEach((entry) => {
      const isDeposit =
        entry.entryType === "CREDIT" &&
        (entry.description?.toLowerCase().includes("seed") ||
          entry.description?.toLowerCase().includes("deposit") ||
          entry.description?.toLowerCase().includes("infusion"));

      items.push({
        id: `ledger-${entry.id}`,
        type: isDeposit ? "deposit" : "transfer",
        title: isDeposit ? "Seed Inflow Credit" : "Atomic Ledger Entry",
        description:
          entry.description ||
          `${entry.entryType} of $${Number(entry.amount)}`,
        amount: Number(entry.amount),
        entryType: entry.entryType,
        timestamp: new Date(entry.createdAt).getTime(),
      });
    });

    snapshots.forEach((snap) => {
      items.push({
        id: `snapshot-${snap.id}`,
        type: "snapshot",
        title: "State Checkpoint Generated",
        description: `Balance snapshot on account ${snap.accountId.slice(
          0,
          8
        )}... at $${Number(snap.balance)}`,
        timestamp: new Date(snap.createdAt).getTime(),
      });
    });

    fraudAlerts.forEach((alert) => {
      items.push({
        id: `fraud-${alert.id}`,
        type: "fraud",
        title: "Risk Telemetry Triggered",
        description: `Risk score ${alert.riskScore} severity ${
          alert.severity
        } on alert: ${alert.triggeredRules[0]}`,
        timestamp: new Date(alert.createdAt).getTime(),
      });
    });

    if (reconciliationReport) {
      items.push({
        id: `recon-${reconciliationReport.runId}`,
        type: "reconciliation",
        title: "Audit Recon Run Completed",
        description: `Scanned ledger entries. Matched: ${reconciliationReport.totalMatched}, Anomalies: ${reconciliationReport.totalMismatched}`,
        timestamp: new Date(reconciliationReport.createdAt).getTime(),
      });
    }

    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
  };

  const timeline = getTimelineItems();

  return (
    <Card className="bg-slate-950 border-slate-900 select-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-blue-500" />
          Ledger Activity Stream
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        {timeline.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono italic text-center py-6">
            No system log streams captured yet.
          </p>
        ) : (
          <div className="relative pl-4 border-l border-slate-800 space-y-5 my-2">
            {timeline.map((item) => {
              let Icon = ArrowUpRight;
              let iconColor =
                "bg-blue-500/10 text-blue-400 border-blue-500/20";

              if (item.type === "deposit") {
                Icon = ArrowDownLeft;
                iconColor =
                  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              } else if (item.type === "snapshot") {
                Icon = Camera;
                iconColor =
                  "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
              } else if (item.type === "fraud") {
                Icon = ShieldAlert;
                iconColor =
                  "bg-rose-500/10 text-rose-450 border-rose-500/20";
              } else if (item.type === "reconciliation") {
                Icon = GitCompare;
                iconColor =
                  "bg-amber-500/10 text-amber-450 border-amber-500/20";
              }

              return (
                <div key={item.id} className="relative space-y-1">
                  {/* Timeline Dot Indicator */}
                  <span
                    className={`absolute -left-[24px] top-0.5 flex items-center justify-center h-4.5 w-4.5 rounded-full border ${iconColor}`}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="font-semibold text-slate-300">
                      {item.title}
                    </span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono leading-normal">
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
