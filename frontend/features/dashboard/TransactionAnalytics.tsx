"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { transactionService } from "@/services/api/endpoints";
import { SkeletonChart } from "@/components/feedback/Loader";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-md rounded-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}</span>
          <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function TransactionAnalytics() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionService.list,
  });

  if (isLoading) return <SkeletonChart />;

  // Build daily buckets for last 7 days
  const days: Record<string, { success: number; failed: number; pending: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    days[key] = { success: 0, failed: 0, pending: 0 };
  }

  transactions.forEach((t) => {
    const key = new Date(t.createdAt).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (key in days) {
      if (t.status === "SUCCESS") days[key].success++;
      else if (t.status === "FAILED") days[key].failed++;
      else if (t.status === "PENDING") days[key].pending++;
    }
  });

  const chartData = Object.entries(days).map(([date, stats]) => ({
    date,
    ...stats,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Transaction Activity</h2>
          <p className="text-xs text-slate-500 mt-0.5">7-day transaction status breakdown</p>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
          Last 7 days
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="success"
            name="Successful"
            stroke="#059669"
            strokeWidth={2}
            fill="url(#gSuccess)"
          />
          <Area
            type="monotone"
            dataKey="failed"
            name="Failed"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#gFailed)"
          />
          <Area
            type="monotone"
            dataKey="pending"
            name="Pending"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="none"
            strokeDasharray="4 2"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
