"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { transactionService } from "@/services/api/endpoints";
import { SkeletonChart } from "@/components/feedback/Loader";

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "#059669",
  FAILED: "#ef4444",
  PENDING: "#f59e0b",
  REVERSED: "#8b5cf6",
};
function CustomLabel({ cx, cy, value, name }: any) {
  return null;
}

export function FinancialOverview() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionService.list,
  });

  if (isLoading) return <SkeletonChart />;

  const statusCounts: Record<string, number> = {};
  transactions.forEach((t) => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const total = transactions.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Transaction Distribution</h2>
        <p className="text-xs text-slate-500 mt-0.5">Status breakdown across all records</p>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <p className="text-sm">No transactions yet</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [String(val ?? 0), ""]}
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">{total}</span>
              <span className="text-xs text-slate-400">total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 space-y-2">
            {pieData.map((entry) => {
              const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0";
              return (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: STATUS_COLORS[entry.name] || "#94a3b8" }}
                    />
                    <span className="text-xs text-slate-600">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-900">{entry.value}</span>
                    <span className="text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
