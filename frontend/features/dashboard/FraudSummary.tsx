"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { fraudService } from "@/services/api/endpoints";
import { ArrowUpRight, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function FraudSummary() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["fraudAlerts"],
    queryFn: fraudService.listAlerts,
  });

  const high = alerts.filter((a) => a.severity === "HIGH").length;
  const medium = alerts.filter((a) => a.severity === "MEDIUM").length;
  const low = alerts.filter((a) => a.severity === "LOW").length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          Fraud Summary
        </h2>
        <Link
          href="/fraud"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
        >
          View <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-slate-400 gap-2">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
          <p className="text-xs">No fraud alerts detected</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[
            { label: "High Severity", count: high, color: "text-red-600 bg-red-50 border-red-200" },
            { label: "Medium Severity", count: medium, color: "text-amber-600 bg-amber-50 border-amber-200" },
            { label: "Low Severity", count: low, color: "text-blue-600 bg-blue-50 border-blue-200" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg"
            >
              <span className="text-xs text-slate-600">{row.label}</span>
              <span
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full border",
                  row.color
                )}
              >
                {row.count}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-slate-400 pt-1 text-center">
            {alerts.length} total active alerts
          </p>
        </div>
      )}
    </div>
  );
}
