"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ledgerService, accountService } from "@/services/api/endpoints";
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
import { ScrollText, Search, RotateCw, Clock, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LedgerPage() {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [sortKey, setSortKey] = React.useState<"createdAt" | "amount" | "entryType">("createdAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<any | null>(null);
  const [replayAccountId, setReplayAccountId] = React.useState("");
  const [replayTimestamp, setReplayTimestamp] = React.useState("");
  const [replayResult, setReplayResult] = React.useState<{ balance: number } | null>(null);

  const PAGE_SIZE = 15;

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["ledger"],
    queryFn: ledgerService.list,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  const balanceAtMutation = useMutation({
    mutationFn: ({ accountId, timestamp }: { accountId: string; timestamp: string }) =>
      ledgerService.getBalanceAt(accountId, timestamp),
    onSuccess: (data) => {
      setReplayResult(data);
      toast.success(`Replayed balance: $${data.balance.toLocaleString()}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.id.toLowerCase().includes(q) || e.accountId.toLowerCase().includes(q) || e.transactionId.toLowerCase().includes(q);
    const matchType = typeFilter === "ALL" || e.entryType === typeFilter;
    return matchSearch && matchType;
  });

  const sorted = [...filtered].sort((a, b) => {
    const va = (a as any)[sortKey] ?? "";
    const vb = (b as any)[sortKey] ?? "";
    const cmp = String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const credits = entries.filter((e) => e.entryType === "CREDIT").length;
  const debits = entries.filter((e) => e.entryType === "DEBIT").length;
  const totalAmount = entries.reduce((s, e) => s + Number(e.amount), 0);

  const SortIcon = ({ col }: { col: typeof sortKey }) =>
    sortKey !== col ? <ChevronsUpDown className="h-3 w-3 text-slate-300" /> :
    sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-blue-600" /> : <ChevronDown className="h-3 w-3 text-blue-600" />;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ledger Explorer</h1>
          <p className="text-sm text-slate-500 mt-0.5">Immutable double-entry event journal with time-travel replay</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Entries", value: entries.length, color: "text-slate-900" },
          { label: "Credit Events", value: credits, color: "text-emerald-600" },
          { label: "Debit Events", value: debits, color: "text-red-600" },
          { label: "Total Volume", value: `$${totalAmount.toLocaleString()}`, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 card-shadow">
            <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
            <p className={cn("text-xl font-bold font-mono", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Time-Travel Replay */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
            <RotateCw className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Balance Time-Travel Replay</h2>
            <p className="text-xs text-slate-500">Reconstruct account balance at any point in time</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Account</label>
            <Select value={replayAccountId} onValueChange={(v) => setReplayAccountId(v ?? "") }>
              <SelectTrigger className="h-9 text-sm border-slate-200">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.userId} — {a.accountType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Point in Time</label>
            <Input
              type="datetime-local"
              value={replayTimestamp}
              onChange={(e) => setReplayTimestamp(e.target.value)}
              className="h-9 text-sm border-slate-200"
            />
          </div>
          <Button
            onClick={() => balanceAtMutation.mutate({ accountId: replayAccountId, timestamp: replayTimestamp })}
            disabled={balanceAtMutation.isPending || !replayAccountId || !replayTimestamp}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm shrink-0"
          >
            {balanceAtMutation.isPending ? "Replaying..." : "Replay"}
          </Button>
        </div>
        {replayResult && (
          <div className="mt-3 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
            <Clock className="h-4 w-4 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800">
              Balance at <strong>{new Date(replayTimestamp).toLocaleString()}</strong>: <strong className="font-mono">${replayResult.balance.toLocaleString()}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by entry ID, account, or transaction..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-sm border-slate-200 bg-white"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v ?? "ALL"); setPage(1); }}>
          <SelectTrigger className="h-9 w-36 text-sm border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="CREDIT">Credit</SelectItem>
            <SelectItem value="DEBIT">Debit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
        {paginated.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="h-6 w-6 text-slate-400" />}
            title="No ledger entries found"
            description="Create transactions to see double-entry ledger records here."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      { key: "id", label: "Entry ID" },
                      { key: "accountId", label: "Account" },
                      { key: "entryType", label: "Type" },
                      { key: "amount", label: "Amount" },
                      { key: "description", label: "Description" },
                      { key: "createdAt", label: "Timestamp" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key as typeof sortKey)}
                        className="text-left px-5 py-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700">
                            {col.label}
                          </span>
                          {["entryType", "amount", "createdAt"].includes(col.key) && <SortIcon col={col.key as typeof sortKey} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((entry) => (
                    <tr key={entry.id} onClick={() => setSelected(entry)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-500">{entry.id.slice(0, 10)}…</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{entry.accountId.slice(0, 8)}…</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                          entry.entryType === "CREDIT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {entry.entryType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm font-semibold text-slate-900">${Number(entry.amount).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 max-w-xs truncate">{entry.description || <span className="text-slate-300">—</span>}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 tabular-nums">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
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

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-white border-l border-slate-200 w-full sm:max-w-md">
          <SheetHeader className="border-b border-slate-100 pb-4">
            <SheetTitle className="text-slate-900 text-base font-bold">Ledger Entry Detail</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border",
                selected.entryType === "CREDIT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
              )}>{selected.entryType}</span>
              <div className="space-y-0">
                {[
                  { label: "Entry ID", value: selected.id, mono: true },
                  { label: "Account ID", value: selected.accountId, mono: true },
                  { label: "Transaction ID", value: selected.transactionId, mono: true },
                  { label: "Amount", value: `$${Number(selected.amount).toLocaleString()}`, mono: true },
                  { label: "Description", value: selected.description || "—" },
                  { label: "Timestamp", value: new Date(selected.createdAt).toLocaleString() },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className={cn("text-xs font-medium text-slate-900 text-right max-w-[60%] break-all", row.mono && "font-mono")}>{row.value}</span>
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
