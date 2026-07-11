"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertOctagon } from "lucide-react";
import { FraudAlert } from "@/types";

interface FraudSummaryProps {
  alerts: FraudAlert[];
}

export function FraudSummary({ alerts = [] }: FraudSummaryProps) {
  const highRisk = alerts.filter((a) => a.severity === "HIGH");
  const mediumRisk = alerts.filter((a) => a.severity === "MEDIUM");
  const lowRisk = alerts.filter((a) => a.severity === "LOW");

  // Collect top rules
  const rulesMap: Record<string, number> = {};
  alerts.forEach((a) => {
    a.triggeredRules.forEach((rule) => {
      rulesMap[rule] = (rulesMap[rule] || 0) + 1;
    });
  });

  const topRules = Object.entries(rulesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <Card className="bg-slate-950 border-slate-900 select-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-rose-500" />
          Fraud & Risk Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Severity Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-900 border border-slate-800 p-2 rounded">
            <span className="text-[9px] font-mono text-rose-400 block uppercase">
              High Risk
            </span>
            <span className="text-base font-bold text-rose-500 font-mono">
              {highRisk.length}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-2 rounded">
            <span className="text-[9px] font-mono text-amber-400 block uppercase">
              Medium Risk
            </span>
            <span className="text-base font-bold text-amber-500 font-mono">
              {mediumRisk.length}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-2 rounded">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">
              Low Risk
            </span>
            <span className="text-base font-bold text-slate-300 font-mono">
              {lowRisk.length}
            </span>
          </div>
        </div>

        {/* Top Triggered Rules */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Top Risk Rule Matches
          </h4>
          {topRules.length === 0 ? (
            <p className="text-[10px] text-slate-600 font-mono italic">
              No rules matched recently.
            </p>
          ) : (
            <div className="space-y-1.5">
              {topRules.map(([rule, count]) => (
                <div
                  key={rule}
                  className="flex justify-between items-center text-xs bg-slate-900/30 p-2 rounded border border-slate-900/60"
                >
                  <span className="font-mono text-slate-400 truncate max-w-[200px]">
                    {rule}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-rose-500/10 text-rose-450 border-rose-500/20 text-[9px] font-mono"
                  >
                    {count} match{count > 1 ? "es" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Suspicious Log list */}
        <div className="space-y-2 border-t border-slate-900 pt-3">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Suspicious Actions
          </h4>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-2 bg-slate-900/20 p-2 rounded text-[11px]"
              >
                <AlertOctagon className="h-3.5 w-3.5 text-rose-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <span className="font-mono text-slate-200 block truncate">
                    Account {a.accountId.slice(0, 8)}...
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Risk Score:{" "}
                    <span className="text-rose-400 font-bold">{a.riskScore}</span>{" "}
                    • {a.triggeredRules[0]}
                  </p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-[10px] text-slate-600 font-mono italic text-center py-2">
                0 suspicious flags. Systems safe.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
