"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/services/api/endpoints";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SkeletonTable } from "@/components/feedback/Loader";

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  REVERSED: "bg-violet-50 text-violet-700 border-violet-200",
};

export function RecentTransactionsTable() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionService.list,
  });

  if (isLoading) return <SkeletonTable />;

  const recent = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Recent Transactions</h2>
          <p className="text-xs text-slate-500 mt-0.5">Latest 8 transfer events</p>
        </div>
        <Link
          href="/transactions"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 transition-colors"
        >
          View all
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          No transactions recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">
                  Transaction ID
                </th>
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                  Reference
                </th>
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                  Status
                </th>
                <th className="text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50 transition-colors cursor-default"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {t.id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">
                    {t.reference || (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                        STATUS_STYLES[t.status] ?? "bg-slate-100 text-slate-600 border-slate-200"
                      )}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-slate-400 tabular-nums">
                    {new Date(t.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
