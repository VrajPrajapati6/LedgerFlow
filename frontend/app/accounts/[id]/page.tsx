"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageLoader } from "@/components/feedback/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  accountService,
  transactionService,
  ledgerService,
  snapshotService,
  fraudService,
  reconciliationService,
} from "@/services/api/endpoints";
import {
  ArrowLeft,
  RotateCw,
  ShieldAlert,
  GitCompare,
  Camera,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LedgerEntry } from "@/types";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BLOCKED: "bg-red-50 text-red-700 border-red-200",
  CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function AccountDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [activeModal, setActiveModal] = React.useState<"deposit" | "transfer" | null>(null);
  const [depositForm, setDepositForm] = React.useState({ amount: "", description: "" });
  const [transferForm, setTransferForm] = React.useState({ toAccountId: "", amount: "" });

  const { data: account, isLoading: accountLoading, refetch: refetchAccount } = useQuery({
    queryKey: ["account", id],
    queryFn: () => accountService.get(id),
  });

  const { data: allAccounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  const { data: ledgerHistory = [], isLoading: ledgerLoading, refetch: refetchLedger } = useQuery({
    queryKey: ["ledgerHistory", id],
    queryFn: () => ledgerService.getHistory(id),
  });

  const { data: latestSnapshot, refetch: refetchSnapshot } = useQuery({
    queryKey: ["latestSnapshot", id],
    queryFn: async () => {
      try { return await snapshotService.getLatest(id); } catch { return null; }
    },
  });

  const { data: fraudHistory = [], refetch: refetchFraud } = useQuery({
    queryKey: ["fraudHistory", id],
    queryFn: () => fraudService.getAccountHistory(id),
  });

  const refetchAll = () => { refetchAccount(); refetchLedger(); refetchSnapshot(); refetchFraud(); };

  const depositMutation = useMutation({
    mutationFn: transactionService.deposit,
    onSuccess: () => { toast.success("Deposit recorded"); setActiveModal(null); setDepositForm({ amount: "", description: "" }); refetchAll(); },
    onError: (e: any) => toast.error(e.message),
  });

  const transferMutation = useMutation({
    mutationFn: transactionService.transfer,
    onSuccess: () => { toast.success("Transfer executed"); setActiveModal(null); setTransferForm({ toAccountId: "", amount: "" }); refetchAll(); },
    onError: (e: any) => toast.error(e.message),
  });

  const snapMutation = useMutation({
    mutationFn: () => snapshotService.create(id),
    onSuccess: () => { toast.success("Snapshot saved"); refetchAll(); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleReplayBalance = async () => {
    try {
      const res = await ledgerService.getBalance(id);
      toast.success(`Replayed balance: $${res.balance.toLocaleString()}`);
    } catch { toast.error("Failed to replay balance"); }
  };

  if (accountLoading || ledgerLoading) return <PageLoader />;

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-14 w-14 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold text-slate-900">Account not found</h3>
          <p className="text-xs text-slate-500 mt-1">This account ID does not exist in the ledger.</p>
        </div>
        <Button onClick={() => router.push("/accounts")} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
          Back to Accounts
        </Button>
      </div>
    );
  }

  // Calculations
  let totalCredits = 0, totalDebits = 0;
  ledgerHistory.forEach((e) => {
    const v = Number(e.amount);
    if (e.entryType === "CREDIT") totalCredits += v;
    else totalDebits += v;
  });

  const timelineData = (() => {
    const sorted = [...ledgerHistory].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    let bal = 0;
    return sorted.map((e) => {
      bal += e.entryType === "CREDIT" ? Number(e.amount) : -Number(e.amount);
      return { date: new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }), balance: bal };
    });
  })();

  const otherAccounts = allAccounts.filter((a) => a.id !== id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/accounts">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Account Detail</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", STATUS_STYLE[account.status])}>
            {account.status}
          </span>
          <Button onClick={refetchAll} variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:bg-slate-100">
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
          <Button onClick={() => setActiveModal("deposit")} variant="outline" size="sm" className="h-8 px-3 text-xs border-slate-200 text-slate-600 hover:bg-slate-100">
            Deposit
          </Button>
          <Button onClick={() => setActiveModal("transfer")} size="sm" className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white">
            Transfer
          </Button>
        </div>
      </div>

      {/* Top Row: Account Info + Balance Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Account Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow space-y-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Account Overview</h2>
          <div className="space-y-3">
            {[
              { label: "User ID", value: account.userId, mono: true },
              { label: "Account Type", value: account.accountType },
              { label: "Currency", value: account.currency, mono: true },
              { label: "Created", value: new Date(account.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-500">{row.label}</span>
                <span className={cn("text-xs font-medium text-slate-900", row.mono && "font-mono")}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Hydrated Balance</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">${(account.balance || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Balance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 card-shadow">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Balance Timeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">Cumulative event-sourced balance history</p>
          </div>
          {timelineData.length < 2 ? (
            <div className="flex items-center justify-center h-44 text-sm text-slate-400">
              Not enough ledger events to chart timeline
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={timelineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Balance"]}
                />
                <Area type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} fill="url(#balGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Credits", value: `+$${totalCredits.toLocaleString()}`, color: "text-emerald-600", icon: TrendingUp },
          { label: "Total Debits", value: `-$${totalDebits.toLocaleString()}`, color: "text-red-600", icon: TrendingDown },
          { label: "Net Balance", value: `$${(totalCredits - totalDebits).toLocaleString()}`, color: "text-slate-900", icon: DollarSign },
          { label: "Ledger Events", value: ledgerHistory.length, color: "text-blue-600", icon: ArrowUpRight },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">{kpi.label}</p>
                <Icon className="h-4 w-4 text-slate-300" />
              </div>
              <p className={cn("text-xl font-bold font-mono", kpi.color)}>{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Operations Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Account Operations</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => snapMutation.mutate()} disabled={snapMutation.isPending} variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-100 gap-1.5">
            <Camera className="h-3.5 w-3.5" /> Generate Snapshot
          </Button>
          <Button onClick={handleReplayBalance} variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-100 gap-1.5">
            <RotateCw className="h-3.5 w-3.5" /> Replay Balance
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-100 gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" /> Fraud Scan
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-100 gap-1.5">
            <GitCompare className="h-3.5 w-3.5" /> Reconcile
          </Button>
        </div>
      </div>

      {/* Ledger History Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Ledger Entry History</h2>
          <p className="text-xs text-slate-500 mt-0.5">{ledgerHistory.length} double-entry events</p>
        </div>
        {ledgerHistory.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No ledger entries for this account.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Entry ID", "Type", "Amount", "Description", "Timestamp"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerHistory.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-slate-500">{e.id.slice(0, 10)}…</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        e.entryType === "CREDIT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                      )}>
                        {e.entryType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm font-semibold text-slate-900">
                      ${Number(e.amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-xs truncate">
                      {e.description || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 tabular-nums">
                      {new Date(e.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fraud History */}
      {fraudHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden card-shadow">
          <div className="px-5 py-4 border-b border-red-100 bg-red-50">
            <h2 className="text-sm font-semibold text-red-800 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Fraud Alerts ({fraudHistory.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {fraudHistory.map((a) => (
              <div key={a.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border mr-2",
                    a.severity === "HIGH" ? "bg-red-50 text-red-700 border-red-200" :
                    a.severity === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"
                  )}>{a.severity}</span>
                  <span className="text-xs text-slate-600">Risk Score: <strong>{a.riskScore}</strong></span>
                </div>
                <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={activeModal === "deposit"} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="bg-white border-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Record Deposit</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">Inject capital into this account's ledger.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Amount (USD)</label>
              <Input type="number" placeholder="0.00" value={depositForm.amount} onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })} className="h-9 text-sm border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Description (optional)</label>
              <Input placeholder="e.g. Initial funding" value={depositForm.description} onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })} className="h-9 text-sm border-slate-200" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => depositMutation.mutate({ accountId: id, amount: Number(depositForm.amount), description: depositForm.description })} disabled={depositMutation.isPending || !depositForm.amount} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm">
              {depositMutation.isPending ? "Processing..." : "Record Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "transfer"} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="bg-white border-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Execute Transfer</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">Send funds from this account to another.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Destination Account</label>
              <Select value={transferForm.toAccountId} onValueChange={(v) => setTransferForm({ ...transferForm, toAccountId: v ?? "" })}>
                <SelectTrigger className="h-9 text-sm border-slate-200"><SelectValue placeholder="Select receiver" /></SelectTrigger>
                <SelectContent>
                  {otherAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.userId} — {a.accountType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Amount (USD)</label>
              <Input type="number" placeholder="0.00" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} className="h-9 text-sm border-slate-200" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => transferMutation.mutate({ senderId: id, receiverId: transferForm.toAccountId, amount: Number(transferForm.amount) })} disabled={transferMutation.isPending || !transferForm.toAccountId || !transferForm.amount} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm">
              {transferMutation.isPending ? "Processing..." : "Execute Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
