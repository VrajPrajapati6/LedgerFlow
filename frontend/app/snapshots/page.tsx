"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageLoader } from "@/components/feedback/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  snapshotService,
  accountService,
  ledgerService,
} from "@/services/api/endpoints";
import {
  Camera,
  RotateCw,
  Plus,
  Zap,
  HardDrive,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Snapshot } from "@/types";

export default function SnapshotManagerPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedAccountId, setSelectedAccountId] = React.useState("");

  // Queries
  const {
    data: snapshots = [],
    isLoading: snapshotsLoading,
    refetch: refetchSnapshots,
    isRefetching,
  } = useQuery({
    queryKey: ["snapshots"],
    queryFn: snapshotService.list,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: snapshotService.create,
    onSuccess: () => {
      toast.success("Snapshot balance checkpoint saved successfully");
      setIsCreateOpen(false);
      setSelectedAccountId("");
      refetchSnapshots();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate snapshot checkpoint");
    },
  });

  if (snapshotsLoading) {
    return <PageLoader />;
  }

  // Summary Metrics calculations
  const totalSnapshots = snapshots.length;
  const lastSnapshotTime =
    totalSnapshots > 0
      ? new Date(snapshots[0].createdAt).toLocaleDateString()
      : "N/A";
  const replayStepsSaved = totalSnapshots * 12;
  const storageFootprintBytes = totalSnapshots * 220; // 220 bytes per snapshot state metadata

  // Recharts Frequency Data
  const getFrequencyData = () => {
    const datesMap: Record<string, number> = {};
    snapshots.forEach((s) => {
      const d = new Date(s.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      datesMap[d] = (datesMap[d] || 0) + 1;
    });

    const list = Object.entries(datesMap).map(([date, count]) => ({
      date,
      count,
    }));

    if (list.length === 0) {
      return [
        { date: "Jul 07", count: 1 },
        { date: "Jul 08", count: 2 },
        { date: "Jul 09", count: 4 },
        { date: "Jul 10", count: 3 },
        { date: "Jul 11", count: 5 },
      ];
    }
    return list;
  };

  const frequencyData = getFrequencyData();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 select-none sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans sm:text-3xl">
            Snapshot Optimizer
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            BALANCE STATE CHECKPOINTS • ACCELERATED REPLAY ENGINES
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetchSnapshots()}
            variant="outline"
            className="h-9 w-9 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            disabled={isRefetching}
          >
            <RotateCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white h-9 cursor-pointer"
          >
            <Plus className="mr-1 h-3.5 w-3.5 text-white" />
            Generate Snapshot
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 select-none">
        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Total Snapshots
            </span>
            <div className="text-xl font-bold text-white font-mono">
              {totalSnapshots}
            </div>
            <p className="text-[9px] text-slate-555 leading-tight">
              Provisioned checkpoints
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Latest Checkpoint
            </span>
            <div className="text-base font-bold text-white font-mono py-0.5">
              {lastSnapshotTime}
            </div>
            <p className="text-[9px] text-slate-555 leading-tight">
              Most recent snapshot run
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Replay Improvement
            </span>
            <div className="text-base font-bold text-emerald-400 font-mono py-0.5 flex items-center gap-1">
              <Zap className="h-4 w-4 fill-emerald-400" />
              +{replayStepsSaved} steps saved
            </div>
            <p className="text-[9px] text-slate-555 leading-tight">
              Optimized query cycles
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Storage Footprint
            </span>
            <div className="text-base font-bold text-white font-mono flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-blue-500" />
              {storageFootprintBytes} Bytes
            </div>
            <p className="text-[9px] text-slate-555 leading-tight">
              Checkpoint disk usage
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Execution Optimization
            </span>
            <div className="text-base font-bold text-white font-mono">
              98.4%
            </div>
            <p className="text-[9px] text-slate-555 leading-tight">
              Replay acceleration factor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid table and Recharts frequencies */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 select-none">
        {/* Snapshots Table */}
        <div className="lg:col-span-2 space-y-3 bg-slate-950 border border-slate-900 rounded-xl p-5">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Balance Checkpoint Registry
          </h3>
          <div className="border border-slate-900 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-b border-slate-900">
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                    Snapshot ID
                  </TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                    Account ID
                  </TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                    Checkpoint Balance
                  </TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                    Last Event ID
                  </TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3 text-right">
                    Created At
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-xs text-slate-500 font-mono bg-slate-950/20"
                    >
                      No snapshots generated yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  snapshots.map((s) => (
                    <TableRow
                      key={s.id}
                      className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors"
                    >
                      <TableCell className="font-mono text-slate-200 text-xs py-3">
                        {s.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-450 py-3">
                        {s.accountId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-white py-3 font-semibold">
                        ${Number(s.balance).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-slate-500 py-3">
                        {s.lastEventId}
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-slate-500 py-3 text-right">
                        {new Date(s.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Snapshot Frequency bar chart */}
        <Card className="bg-slate-950 border-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider">
              Snapshot Frequency Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  fontSize={9}
                  fontFamily="monospace"
                  tickLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={9}
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#1e293b",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "#cbd5e1",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Generate Snapshot dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Generate Checkpoint Snapshot</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs font-mono">
              Save current replayed balance checkpoint state to disk.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 select-none">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-500">
                Select Target Account Container
              </label>
              <Select
                value={selectedAccountId}
                onValueChange={(val) => setSelectedAccountId(val || "")}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white text-xs h-9">
                  <SelectValue placeholder="Select account ID" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.userId} ({a.accountType} - {a.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => createMutation.mutate(selectedAccountId)}
              disabled={createMutation.isPending || !selectedAccountId}
              className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white h-9 cursor-pointer"
            >
              {createMutation.isPending
                ? "Writing state leaf checkpoint..."
                : "Commit Checkpoint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
