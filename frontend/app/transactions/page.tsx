"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/services/api/endpoints";
import { Transaction } from "@/types";
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
import {
  Search,
  Download,
  ArrowLeftRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  REVERSED: "bg-violet-50 text-violet-700 border-violet-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  SUCCESS: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
  FAILED: <XCircle className="h-3.5 w-3.5 text-red-600" />,
  PENDING: <Clock className="h-3.5 w-3.5 text-amber-600" />,
  REVERSED: <RotateCw className="h-3.5 w-3.5 text-violet-600" />,
};

type SortKey = "createdAt" | "status" | "reference" | "amount";
type SortDir = "asc" | "desc";

export default function TransactionsPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Transaction | null>(null);

  const PAGE_SIZE = 15;

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionService.list,
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.id.toLowerCase().includes(q) || (t.reference || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let va: any = (a as any)[sortKey] ?? "";
    let vb: any = (b as any)[sortKey] ?? "";
    const cmp = String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey !== col ? <ChevronsUpDown className="h-3 w-3 text-slate-300" /> :
    sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-blue-600" /> : <ChevronDown className="h-3 w-3 text-blue-600" />;

  // Summary stats
  const stats = {
    total: transactions.length,
    success: transactions.filter((t) => t.status === "SUCCESS").length,
    failed: transactions.filter((t) => t.status === "FAILED").length,
    pending: transactions.filter((t) => t.status === "PENDING").length,
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Transactions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Complete transfer log and financial event history</p>
        </div>
        <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-100 h-8 text-xs gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "text-slate-900" },
          { label: "Successful", value: stats.success, color: "text-emerald-600" },
          { label: "Failed", value: stats.failed, color: "text-red-600" },
          { label: "Pending", value: stats.pending, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 card-shadow">
            <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by ID or reference..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-sm border-slate-200 bg-white placeholder:text-slate-400"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "ALL"); setPage(1); }}>
          <SelectTrigger className="h-9 w-40 text-sm border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="SUCCESS">Success</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REVERSED">Reversed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
        {paginated.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight className="h-6 w-6 text-slate-400" />}
            title="No transactions found"
            description={search || statusFilter !== "ALL" ? "Try adjusting your filters." : "No transactions have been recorded yet."}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      { key: "id", label: "Transaction ID" },
                      { key: "reference", label: "Reference" },
                      { key: "status", label: "Status" },
                      { key: "amount", label: "Amount" },
                      { key: "createdAt", label: "Date" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key as SortKey)}
                        className="text-left px-5 py-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700">
                            {col.label}
                          </span>
                          <SortIcon col={col.key as SortKey} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {t.id.slice(0, 10)}…
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        {t.reference || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border", STATUS_STYLE[t.status])}>
                          {STATUS_ICONS[t.status]}
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-700">
                        {t.amount != null ? `$${Number(t.amount).toLocaleString()}` : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 tabular-nums">
                        {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
                </p>
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

      {/* Transaction Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-white border-l border-slate-200 w-full sm:max-w-md">
          <SheetHeader className="border-b border-slate-100 pb-4">
            <SheetTitle className="text-slate-900 text-base font-bold">Transaction Detail</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-5">
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border", STATUS_STYLE[selected.status])}>
                  {STATUS_ICONS[selected.status]} {selected.status}
                </span>
              </div>
              <div className="space-y-0">
                {[
                  { label: "Transaction ID", value: selected.id, mono: true },
                  { label: "Reference", value: selected.reference || "—" },
                  { label: "Amount", value: selected.amount != null ? `$${Number(selected.amount).toLocaleString()}` : "—", mono: true },
                  { label: "Created At", value: new Date(selected.createdAt).toLocaleString() },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className={cn("text-xs font-medium text-slate-900 text-right max-w-[60%] break-all", row.mono && "font-mono")}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
