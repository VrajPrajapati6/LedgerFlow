"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { fraudService } from "@/services/api/endpoints";
import { FraudAlert } from "@/types";
import { PageLoader, EmptyState } from "@/components/feedback/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ShieldAlert, Search, ChevronUp, ChevronDown, ChevronsUpDown, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const SEV_STYLE: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  LOW: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function FraudPage() {
  const [search, setSearch] = React.useState("");
  const [sevFilter, setSevFilter] = React.useState("ALL");
  const [sortKey, setSortKey] = React.useState<"createdAt" | "riskScore" | "severity">("createdAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<FraudAlert | null>(null);
  const PAGE_SIZE = 15;

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ["fraudAlerts"],
    queryFn: fraudService.listAlerts,
  });

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const filtered = alerts.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.id.toLowerCase().includes(q) || a.accountId.toLowerCase().includes(q) || a.transactionId.toLowerCase().includes(q);
    const matchSev = sevFilter === "ALL" || a.severity === sevFilter;
    return matchSearch && matchSev;
  });

  const sorted = [...filtered].sort((a, b) => {
    const va = (a as any)[sortKey] ?? "";
    const vb = (b as any)[sortKey] ?? "";
    const cmp = String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const high = alerts.filter((a) => a.severity === "HIGH").length;
  const medium = alerts.filter((a) => a.severity === "MEDIUM").length;
  const low = alerts.filter((a) => a.severity === "LOW").length;

  const SortIcon = ({ col }: { col: typeof sortKey }) =>
    sortKey !== col ? <ChevronsUpDown className="h-3 w-3 text-slate-300" /> :
    sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-blue-600" /> : <ChevronDown className="h-3 w-3 text-blue-600" />;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" /> Fraud Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Risk alert monitoring and transaction investigation console</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-100 h-8 text-xs gap-1.5">
          Refresh Alerts
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Alerts", value: alerts.length, color: "text-slate-900", bg: "bg-slate-50 border-slate-200" },
          { label: "High Severity", value: high, color: "text-red-700", bg: "bg-red-50 border-red-200" },
          { label: "Medium Severity", value: medium, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "Low Severity", value: low, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl border p-4", s.bg)}>
            <p className="text-xs font-medium text-slate-500 mb-0.5">{s.label}</p>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Risk Indicator */}
      {high > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800 font-medium">
            {high} high-severity alert{high > 1 ? "s" : ""} require immediate investigation.
          </p>
        </div>
      )}
      {high === 0 && alerts.length > 0 && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3.5">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800 font-medium">No critical threats. All high-severity alerts resolved.</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input placeholder="Search by alert ID, account, or transaction..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9 text-sm border-slate-200 bg-white" />
        </div>
        <Select value={sevFilter} onValueChange={(v) => { setSevFilter(v ?? "ALL"); setPage(1); }}>
          <SelectTrigger className="h-9 w-40 text-sm border-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Severities</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
        {paginated.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="h-6 w-6 text-emerald-500" />}
            title="No fraud alerts"
            description={alerts.length === 0 ? "No suspicious activity detected in the system." : "No alerts match your filters."}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      { key: "id", label: "Alert ID" },
                      { key: "accountId", label: "Account" },
                      { key: "transactionId", label: "Transaction" },
                      { key: "severity", label: "Severity" },
                      { key: "riskScore", label: "Risk Score" },
                      { key: "createdAt", label: "Detected" },
                    ].map((col) => (
                      <th key={col.key} onClick={() => handleSort(col.key as typeof sortKey)} className="text-left px-5 py-3 cursor-pointer group">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700">{col.label}</span>
                          {["severity", "riskScore", "createdAt"].includes(col.key) && <SortIcon col={col.key as typeof sortKey} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((alert) => (
                    <tr key={alert.id} onClick={() => setSelected(alert)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500">{alert.id.slice(0, 10)}…</span></td>
                      <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{alert.accountId.slice(0, 8)}…</span></td>
                      <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500">{alert.transactionId.slice(0, 8)}…</span></td>
                      <td className="px-5 py-3.5">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border", SEV_STYLE[alert.severity])}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", alert.riskScore >= 70 ? "bg-red-500" : alert.riskScore >= 40 ? "bg-amber-500" : "bg-blue-400")} style={{ width: `${alert.riskScore}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 tabular-nums">{alert.riskScore}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 tabular-nums">
                        {new Date(alert.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}</p>
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

      {/* Investigation Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-white border-l border-slate-200 w-full sm:max-w-md">
          <SheetHeader className="border-b border-slate-100 pb-4">
            <SheetTitle className="text-slate-900 text-base font-bold">Alert Investigation</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border", SEV_STYLE[selected.severity])}>
                  {selected.severity} RISK
                </span>
                <span className="text-sm font-bold text-slate-900">Score: {selected.riskScore}/100</span>
              </div>
              <div className="space-y-0">
                {[
                  { label: "Alert ID", value: selected.id, mono: true },
                  { label: "Account ID", value: selected.accountId, mono: true },
                  { label: "Transaction ID", value: selected.transactionId, mono: true },
                  { label: "Detected At", value: new Date(selected.createdAt).toLocaleString() },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className={cn("text-xs font-medium text-slate-900 text-right max-w-[60%] break-all", row.mono && "font-mono")}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-700 mb-2">Triggered Rules</p>
                <div className="space-y-1">
                  {selected.triggeredRules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                      <span className="text-xs font-mono text-slate-600">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
