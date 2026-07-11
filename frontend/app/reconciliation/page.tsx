"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reconciliationService } from "@/services/api/endpoints";
import { PageLoader, EmptyState } from "@/components/feedback/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GitCompare, Search, Play, ChevronUp, ChevronDown, ChevronsUpDown, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MISMATCH_STYLE: Record<string, string> = {
  MISSING_SETTLEMENT: "bg-red-50 text-red-700 border-red-200",
  AMOUNT_MISMATCH: "bg-amber-50 text-amber-700 border-amber-200",
  STATUS_MISMATCH: "bg-violet-50 text-violet-700 border-violet-200",
  DUPLICATE_SETTLEMENT: "bg-orange-50 text-orange-700 border-orange-200",
};

export default function ReconciliationPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 15;

  const { data: report, isLoading: reportLoading, refetch: refetchReport } = useQuery({
    queryKey: ["reconciliationReport"],
    queryFn: reconciliationService.getReport,
  });

  const { data: failures = [], isLoading: failuresLoading, refetch: refetchFailures } = useQuery({
    queryKey: ["reconciliationFailures"],
    queryFn: reconciliationService.listFailures,
  });

  const runMutation = useMutation({
    mutationFn: reconciliationService.run,
    onSuccess: () => {
      toast.success("Reconciliation scan completed successfully");
      queryClient.invalidateQueries({ queryKey: ["reconciliationReport"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliationFailures"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = failures.filter((f) => {
    const q = search.toLowerCase();
    return !q || f.id.toLowerCase().includes(q) || f.transactionId.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isLoading = reportLoading || failuresLoading;
  if (isLoading) return <PageLoader />;

  const total = report ? report.totalMatched + report.totalMismatched : 0;
  const matchRate = total > 0 && report ? ((report.totalMatched / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-violet-500" /> Reconciliation Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Settlement audit — internal vs external transaction matching</p>
        </div>
        <Button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1.5"
        >
          <Play className="h-3.5 w-3.5" />
          {runMutation.isPending ? "Running..." : "Run Reconciliation"}
        </Button>
      </div>

      {/* Report Summary */}
      {report ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Match Rate Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
            <p className="text-xs text-slate-500 mb-1">Match Rate</p>
            <p className="text-3xl font-bold text-slate-900 font-mono">{matchRate}%</p>
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${matchRate}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2">{report.totalMatched} of {total} records matched</p>
          </div>
          {/* Matched */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-emerald-700">Matched Records</p>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-800">{report.totalMatched}</p>
            <p className="text-xs text-emerald-600 mt-1">Verified settlements</p>
          </div>
          {/* Mismatched */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-red-700">Mismatched Records</p>
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-800">{report.totalMismatched}</p>
            <p className="text-xs text-red-600 mt-1">Require investigation</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 card-shadow text-center">
          <GitCompare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700 mb-1">No reconciliation data</p>
          <p className="text-xs text-slate-500 mb-4">Run a reconciliation scan to compare your ledger against external settlements.</p>
          <Button onClick={() => runMutation.mutate()} disabled={runMutation.isPending} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
            <Play className="h-3.5 w-3.5 mr-1" /> Run First Scan
          </Button>
        </div>
      )}

      {/* Failure Breakdown */}
      {report && Object.keys(report.failuresCount || {}).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Failure Breakdown</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(report.failuresCount).map(([type, count]) => (
              <div key={type} className={cn("rounded-lg border px-4 py-3", MISMATCH_STYLE[type] || "bg-slate-50 border-slate-200 text-slate-700")}>
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-1">{type.replace(/_/g, " ")}</p>
                <p className="text-xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failures Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Reconciliation Failures ({failures.length})</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input placeholder="Search failures..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9 text-sm border-slate-200 bg-white" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
          {paginated.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-6 w-6 text-emerald-500" />}
              title="No reconciliation failures"
              description={failures.length === 0 ? "All settlements match. System is reconciled." : "No failures match your search."}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      {["Failure ID", "Run ID", "Transaction ID", "Mismatch Type", "Details", "Detected"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginated.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500">{f.id.slice(0, 10)}…</span></td>
                        <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500">{f.runId.slice(0, 10)}…</span></td>
                        <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500">{f.transactionId.slice(0, 10)}…</span></td>
                        <td className="px-5 py-3.5">
                          <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border", MISMATCH_STYLE[f.mismatchType])}>
                            {f.mismatchType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600 max-w-xs truncate">{f.details || <span className="text-slate-300">—</span>}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 tabular-nums">
                          {new Date(f.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-xs text-slate-500">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-7 px-2.5 text-xs border-slate-200">Previous</Button>
                    <span className="text-xs text-slate-500 px-2">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-7 px-2.5 text-xs border-slate-200">Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
