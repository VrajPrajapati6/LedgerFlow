"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ledgerService, accountService, snapshotService } from "@/services/api/endpoints";
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
import { History, RotateCw, Clock, FileClock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuditPage() {
  const [replayAccountId, setReplayAccountId] = React.useState("");
  const [replayTimestamp, setReplayTimestamp] = React.useState("");
  const [replayResult, setReplayResult] = React.useState<{ balance: number; timestamp: string } | null>(null);
  const [searchAccount, setSearchAccount] = React.useState("");

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  const { data: snapshots = [], isLoading: snapshotsLoading } = useQuery({
    queryKey: ["snapshots"],
    queryFn: snapshotService.list,
  });

  const { data: ledger = [], isLoading: ledgerLoading } = useQuery({
    queryKey: ["ledger"],
    queryFn: ledgerService.list,
  });

  const replayMutation = useMutation({
    mutationFn: ({ accountId, timestamp }: { accountId: string; timestamp: string }) =>
      ledgerService.getBalanceAt(accountId, timestamp),
    onSuccess: (data) => {
      setReplayResult({ balance: data.balance, timestamp: replayTimestamp });
      toast.success(`State replayed — balance at point: $${data.balance.toLocaleString()}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (accountsLoading || ledgerLoading) return <PageLoader />;

  // Build audit timeline from ledger events
  const filteredLedger = ledger.filter((e) =>
    !searchAccount || e.accountId.toLowerCase().includes(searchAccount.toLowerCase())
  );
  const recent = [...filteredLedger].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-500" /> Audit Trail Explorer
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Point-in-time state reconstruction and event-sourcing audit</p>
        </div>
      </div>

      {/* Time-Travel Replay Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center shrink-0">
            <RotateCw className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">State Time-Travel Engine</h2>
            <p className="text-xs text-slate-500">Reconstruct any account's exact balance at any historical moment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Target Account</label>
            <Select value={replayAccountId} onValueChange={(v) => setReplayAccountId(v ?? "") }>
              <SelectTrigger className="h-9 text-sm border-slate-200">
                <SelectValue placeholder="Choose account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.userId} — {a.accountType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Point in Time (UTC)</label>
            <Input type="datetime-local" value={replayTimestamp} onChange={(e) => setReplayTimestamp(e.target.value)} className="h-9 text-sm border-slate-200" />
          </div>
          <div className="flex flex-col justify-end">
            <Button
              onClick={() => replayMutation.mutate({ accountId: replayAccountId, timestamp: replayTimestamp })}
              disabled={replayMutation.isPending || !replayAccountId || !replayTimestamp}
              className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-sm gap-1.5"
            >
              <RotateCw className="h-4 w-4" />
              {replayMutation.isPending ? "Replaying..." : "Replay State"}
            </Button>
          </div>
        </div>

        {replayResult && (
          <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-indigo-900">State Reconstruction Complete</p>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Account balance at <strong>{new Date(replayResult.timestamp).toLocaleString()}</strong>
                </p>
                <p className="text-2xl font-bold text-indigo-900 font-mono mt-2">${replayResult.balance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Total Ledger Events", value: ledger.length },
          { label: "Unique Accounts", value: new Set(ledger.map((e) => e.accountId)).size },
          { label: "Snapshots Available", value: snapshots.length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 card-shadow">
            <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Audit Event Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Event Stream</h2>
            <p className="text-xs text-slate-500 mt-0.5">Chronological double-entry audit trail</p>
          </div>
          <Input
            placeholder="Filter by account ID..."
            value={searchAccount}
            onChange={(e) => setSearchAccount(e.target.value)}
            className="h-8 text-xs border-slate-200 w-52"
          />
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={<History className="h-6 w-6 text-slate-400" />}
            title="No audit events"
            description="Ledger events will appear here as transactions are processed."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Timestamp", "Account", "Type", "Amount", "Transaction", "Description"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-400 tabular-nums whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{entry.accountId.slice(0, 8)}…</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        entry.entryType === "CREDIT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                      )}>
                        {entry.entryType}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-sm font-semibold text-slate-900">${Number(entry.amount).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-slate-500">{entry.transactionId.slice(0, 8)}…</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600 max-w-xs truncate">
                      {entry.description || <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
