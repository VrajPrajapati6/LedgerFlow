"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { snapshotService, accountService } from "@/services/api/endpoints";
import { PageLoader, EmptyState } from "@/components/feedback/Loader";
import { Button } from "@/components/ui/button";
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
import { FileClock, Plus, Camera, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

export default function SnapshotsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = React.useState(false);
  const [targetAccountId, setTargetAccountId] = React.useState("");

  const { data: snapshots = [], isLoading: snapshotsLoading } = useQuery({
    queryKey: ["snapshots"],
    queryFn: snapshotService.list,
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  const createMutation = useMutation({
    mutationFn: snapshotService.create,
    onSuccess: () => {
      toast.success("Snapshot checkpoint saved");
      queryClient.invalidateQueries({ queryKey: ["snapshots"] });
      setShowCreate(false);
      setTargetAccountId("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (snapshotsLoading || accountsLoading) return <PageLoader />;

  // Chart: snapshots per day
  const dailyCounts: Record<string, number> = {};
  snapshots.forEach((s) => {
    const day = new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  const chartData = Object.entries(dailyCounts)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-10)
    .map(([date, count]) => ({ date, count }));

  // Stats
  const uniqueAccounts = new Set(snapshots.map((s) => s.accountId)).size;
  const recent = [...snapshots].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileClock className="h-5 w-5 text-teal-500" /> Snapshot Manager
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Balance checkpoints for event-sourcing replay optimization</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Generate Snapshot
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Total Snapshots", value: snapshots.length },
          { label: "Accounts Covered", value: uniqueAccounts },
          { label: "Latest Checkpoint", value: recent[0] ? new Date(recent[0].createdAt).toLocaleDateString() : "—" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 card-shadow">
            <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Snapshot Frequency Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-900">Snapshot Activity</h2>
            <span className="text-xs text-slate-400">— checkpoints per day</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v: any) => [v, "Snapshots"]}
              />
              <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Snapshots Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Checkpoint Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">{snapshots.length} total balance checkpoints</p>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={<Camera className="h-6 w-6 text-slate-400" />}
            title="No snapshots yet"
            description="Generate your first balance checkpoint to accelerate event-sourcing replay."
            action={
              <Button onClick={() => setShowCreate(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Generate Snapshot
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Snapshot ID", "Account ID", "Balance at Checkpoint", "Last Event ID", "Created At"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((snap) => (
                  <tr key={snap.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500">{snap.id.slice(0, 10)}…</span></td>
                    <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{snap.accountId.slice(0, 8)}…</span></td>
                    <td className="px-5 py-3.5 font-mono text-sm font-bold text-emerald-700">${Number(snap.balance).toLocaleString()}</td>
                    <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500">{snap.lastEventId.slice(0, 10)}…</span></td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 tabular-nums">
                      {new Date(snap.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-white border-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Generate Snapshot</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Save a balance checkpoint to optimize future event replay.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <label className="text-xs font-medium text-slate-700">Target Account</label>
            <Select value={targetAccountId} onValueChange={(v) => setTargetAccountId(v ?? "") }>
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
          <DialogFooter>
            <Button
              onClick={() => createMutation.mutate(targetAccountId)}
              disabled={createMutation.isPending || !targetAccountId}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
            >
              {createMutation.isPending ? "Saving..." : "Generate Checkpoint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
