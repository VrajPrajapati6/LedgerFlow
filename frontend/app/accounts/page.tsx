"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountService } from "@/services/api/endpoints";
import { Account } from "@/types";
import { PageLoader, EmptyState } from "@/components/feedback/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Download,
  Landmark,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BLOCKED: "bg-red-50 text-red-700 border-red-200",
  CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
};

type SortKey = keyof Account | "";
type SortDir = "asc" | "desc";

export default function AccountsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(1);
  const [showCreate, setShowCreate] = React.useState(false);
  const [form, setForm] = React.useState({
    userId: "",
    accountType: "SAVINGS",
    currency: "USD",
  });

  const PAGE_SIZE = 12;

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  const createMutation = useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      toast.success("Account provisioned successfully");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setShowCreate(false);
      setForm({ userId: "", accountType: "SAVINGS", currency: "USD" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = accounts.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      a.id.toLowerCase().includes(q) ||
      a.userId.toLowerCase().includes(q) ||
      a.accountType.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const va = (a as any)[sortKey] ?? "";
    const vb = (b as any)[sortKey] ?? "";
    const cmp = String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 text-slate-300" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-blue-600" />
    ) : (
      <ChevronDown className="h-3 w-3 text-blue-600" />
    );
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Accounts</h1>
          <p className="text-sm text-slate-500">
            {accounts.length} registered account{accounts.length !== 1 ? "s" : ""} · Ledger containers and balance owners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-600 hover:bg-slate-100 h-8 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Account
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by ID, user, type..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-sm border-slate-200 bg-white placeholder:text-slate-400"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "ALL"); setPage(1); }}>
          <SelectTrigger className="h-9 w-36 text-sm border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
        {paginated.length === 0 ? (
          <EmptyState
            icon={<Landmark className="h-6 w-6 text-slate-400" />}
            title="No accounts found"
            description={
              search || statusFilter !== "ALL"
                ? "Try adjusting your search or filter criteria."
                : "Create the first account to start tracking balances."
            }
            action={
              !search && statusFilter === "ALL" ? (
                <Button
                  onClick={() => setShowCreate(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create Account
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      { key: "id", label: "Account ID" },
                      { key: "userId", label: "User" },
                      { key: "accountType", label: "Type" },
                      { key: "currency", label: "Currency" },
                      { key: "status", label: "Status" },
                      { key: "createdAt", label: "Created" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key as SortKey)}
                        className="text-left px-5 py-3 cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
                            {col.label}
                          </span>
                          <SortIcon col={col.key as SortKey} />
                        </div>
                      </th>
                    ))}
                    <th className="px-5 py-3 text-right">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((account) => (
                    <tr
                      key={account.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {account.id.slice(0, 10)}…
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-700 font-medium">
                        {account.userId}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {account.accountType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 font-mono">
                        {account.currency}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            STATUS_STYLE[account.status] ?? "bg-slate-100 text-slate-600 border-slate-200"
                          )}
                        >
                          {account.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 tabular-nums">
                        {new Date(account.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/accounts/${account.id}`)}
                          className="h-7 px-2.5 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-7 px-2.5 text-xs border-slate-200"
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-slate-500 px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-7 px-2.5 text-xs border-slate-200"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Account Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-white border-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Provision Account</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Create a new ledger container for a user identity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">User ID</label>
              <Input
                placeholder="e.g. user_abc123"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="h-9 text-sm border-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Account Type</label>
                <Select
                  value={form.accountType}
                  onValueChange={(v) => setForm({ ...form, accountType: v ?? form.accountType })}
                >
                  <SelectTrigger className="h-9 text-sm border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    <SelectItem value="CHECKING">Checking</SelectItem>
                    <SelectItem value="ESCROW">Escrow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Currency</label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm({ ...form, currency: v ?? form.currency })}
                >
                  <SelectTrigger className="h-9 text-sm border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="NGN">NGN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreate(false)}
              className="border-slate-200 text-slate-600 h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.userId}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
            >
              {createMutation.isPending ? "Creating..." : "Provision Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
