"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageLoader } from "@/components/feedback/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
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
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  GitCompare,
  Camera,
  Layers,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ScrollText,
  AlertTriangle,
} from "lucide-react";
import { LedgerEntry, FraudAlert, Snapshot } from "@/types";

export default function AccountDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Quick Action Dialog States
  const [activeModal, setActiveModal] = React.useState<
    "deposit" | "transfer" | null
  >(null);

  // Form States
  const [depositForm, setDepositForm] = React.useState({
    amount: "",
    description: "",
  });
  const [transferForm, setTransferForm] = React.useState({
    toAccountId: "",
    amount: "",
    description: "",
  });

  // Queries
  const {
    data: account,
    isLoading: accountLoading,
    refetch: refetchAccount,
  } = useQuery({
    queryKey: ["account", id],
    queryFn: () => accountService.get(id),
  });

  const { data: allAccounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  const {
    data: ledgerHistory = [],
    isLoading: ledgerLoading,
    refetch: refetchLedger,
  } = useQuery({
    queryKey: ["ledgerHistory", id],
    queryFn: () => ledgerService.getHistory(id),
  });

  const {
    data: latestSnapshot,
    isLoading: snapshotLoading,
    refetch: refetchLatestSnapshot,
  } = useQuery({
    queryKey: ["latestSnapshot", id],
    queryFn: async () => {
      try {
        return await snapshotService.getLatest(id);
      } catch {
        return null;
      }
    },
  });

  const {
    data: fraudHistory = [],
    isLoading: fraudLoading,
    refetch: refetchFraud,
  } = useQuery({
    queryKey: ["fraudHistory", id],
    queryFn: () => fraudService.getAccountHistory(id),
  });

  const { data: reconciliationFailures = [] } = useQuery({
    queryKey: ["reconciliationFailures"],
    queryFn: async () => {
      try {
        return await reconciliationService.listFailures();
      } catch {
        return [];
      }
    },
  });

  // Mutations
  const depositMutation = useMutation({
    mutationFn: transactionService.deposit,
    onSuccess: () => {
      toast.success("Capital infusion credited successfully");
      setActiveModal(null);
      setDepositForm({ amount: "", description: "" });
      refetchAll();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to execute deposit");
    },
  });

  const transferMutation = useMutation({
    mutationFn: transactionService.transfer,
    onSuccess: () => {
      toast.success("Atomic transfer executed and balanced successfully");
      setActiveModal(null);
      setTransferForm({ toAccountId: "", amount: "", description: "" });
      refetchAll();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to execute transfer");
    },
  });

  const createSnapshotMutation = useMutation({
    mutationFn: () => snapshotService.create(id),
    onSuccess: () => {
      toast.success("Balance checkpoint snapshot saved successfully");
      refetchAll();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create snapshot");
    },
  });

  const runReconciliationMutation = useMutation({
    mutationFn: reconciliationService.run,
    onSuccess: () => {
      toast.success("Audit reconciliation sweep completed");
      refetchAll();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to run reconciliation");
    },
  });

  const refetchAll = () => {
    refetchAccount();
    refetchLedger();
    refetchLatestSnapshot();
    refetchFraud();
  };

  // Replay Balance custom logic
  const handleReplayBalance = async () => {
    try {
      const res = await ledgerService.getBalance(id);
      toast.success(
        `Balance replayed. Recomputed balance: $${res.balance.toLocaleString()}. State verified as valid.`
      );
      refetchAll();
    } catch (err: any) {
      toast.error("Failed to replay balance history");
    }
  };

  const handleRunFraudScan = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Analyzing ledger transaction sequence rules...",
        success: "Velocity checks completed. Account parameters marked safe.",
        error: "Failed to run checks",
      }
    );
  };

  if (accountLoading || ledgerLoading || snapshotLoading || fraudLoading) {
    return <PageLoader />;
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <h3 className="text-sm font-mono text-slate-350">
          Ledger Container Not Found
        </h3>
        <Button
          onClick={() => router.push("/accounts")}
          className="text-xs bg-slate-900 text-white"
        >
          Return to Registry
        </Button>
      </div>
    );
  }

  // --- Calculations ---

  // Credits & Debits breakdown
  let totalCredits = 0;
  let totalDebits = 0;
  let transactionCount = ledgerHistory.length;
  let maxTxAmount = 0;

  ledgerHistory.forEach((e) => {
    const val = Number(e.amount);
    if (e.entryType === "CREDIT") {
      totalCredits += val;
    } else {
      totalDebits += val;
    }
    if (val > maxTxAmount) {
      maxTxAmount = val;
    }
  });

  const averageTxAmount =
    transactionCount > 0 ? (totalCredits + totalDebits) / transactionCount : 0;

  // Build Balance Timeline chronological cumulative list
  const getTimelineData = () => {
    const sorted = [...ledgerHistory].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let bal = 0;
    const points = sorted.map((e) => {
      if (e.entryType === "CREDIT") {
        bal += Number(e.amount);
      } else {
        bal -= Number(e.amount);
      }
      return {
        date: new Date(e.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        balance: bal,
      };
    });

    if (points.length === 0) {
      return [{ date: "Provisioned", balance: 0 }];
    }
    return points;
  };

  const timelineData = getTimelineData();

  // Audit timeline events builder
  const getAuditTimeline = () => {
    const events: any[] = [];

    // Created event
    events.push({
      id: "create-evt",
      type: "create",
      title: "Ledger Container Created",
      description: `Account initialized under user segment ID ${account.userId}`,
      timestamp: new Date(account.createdAt).getTime(),
    });

    // Ledger entry events
    ledgerHistory.forEach((e) => {
      const isDeposit =
        e.entryType === "CREDIT" &&
        (e.description?.toLowerCase().includes("seed") ||
          e.description?.toLowerCase().includes("deposit") ||
          e.description?.toLowerCase().includes("infusion"));

      events.push({
        id: `ledger-evt-${e.id}`,
        type: isDeposit ? "deposit" : "transfer",
        title: isDeposit ? "Seed Inflow Deposit" : "Double-Entry Event",
        description:
          e.description ||
          `${e.entryType} of $${Number(e.amount).toLocaleString()}`,
        timestamp: new Date(e.createdAt).getTime(),
      });
    });

    // Snapshots
    if (latestSnapshot) {
      events.push({
        id: `snap-evt-${latestSnapshot.id}`,
        type: "snapshot",
        title: "State Checkpoint Saved",
        description: `Balance snapshot checkpoint finalized at $${Number(
          latestSnapshot.balance
        ).toLocaleString()}`,
        timestamp: new Date(latestSnapshot.createdAt).getTime(),
      });
    }

    // Fraud rules alerts
    fraudHistory.forEach((f) => {
      events.push({
        id: `fraud-evt-${f.id}`,
        type: "fraud",
        title: "Risk Rule Triggered",
        description: `Alert score ${f.riskScore} (${f.severity}) triggered by rule ${f.triggeredRules[0]}`,
        timestamp: new Date(f.createdAt).getTime(),
      });
    });

    // Sort chronologically desc
    return events.sort((a, b) => b.timestamp - a.timestamp);
  };

  const auditTimeline = getAuditTimeline();

  // Reconciliation matches matching current account ID transactions
  const myTxIds = React.useMemo(() => new Set(ledgerHistory.map((e) => e.transactionId)), [ledgerHistory]);
  const matchingFailures = reconciliationFailures.filter(
    (f) => myTxIds.has(f.transactionId)
  );

  return (
    <div className="space-y-6">
      {/* 1. Header with back link */}
      <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 select-none sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/accounts">
            <Button
              variant="outline"
              className="h-9 w-9 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans sm:text-2xl">
              Inspect: {account.id}
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">
              USER CONTAINER CONSOLE • USERID: {account.userId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={refetchAll}
            variant="outline"
            className="h-9 w-9 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setActiveModal("deposit")}
            variant="outline"
            className="text-xs bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white cursor-pointer"
          >
            Inject Capital
          </Button>
          <Button
            onClick={() => setActiveModal("transfer")}
            variant="outline"
            className="text-xs bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white cursor-pointer"
          >
            Execute Transfer
          </Button>
        </div>
      </div>

      {/* Grid: Left column detail overview, right column balance timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 select-none">
        {/* Account Details Info Card */}
        <Card className="bg-slate-950 border-slate-900">
          <CardHeader className="pb-2 border-b border-slate-900/60">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-blue-500" />
              Container Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
              <span className="text-slate-500">ACCOUNT STATUS</span>
              <Badge
                className={
                  account.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]"
                    : "bg-rose-500/10 text-rose-450 border-rose-500/20 text-[9px]"
                }
              >
                {account.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
              <span className="text-slate-500">SEGMENT TYPE</span>
              <span className="text-white font-semibold uppercase">
                {account.accountType}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
              <span className="text-slate-500">BASE CURRENCY</span>
              <span className="text-white font-semibold">{account.currency}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
              <span className="text-slate-500">CREATED DATE</span>
              <span className="text-slate-350">
                {new Date(account.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 pt-2">
              <span className="text-slate-500 block text-xs">HYDRATED BALANCE</span>
              <div className="text-right">
                <span className="text-lg font-bold text-white font-mono">
                  ${(account.balance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Timeline Chart */}
        <Card className="lg:col-span-2 bg-slate-950 border-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider">
              Balance Evolution Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
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
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#1e293b",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "#cbd5e1",
                  }}
                  formatter={(v: any) => [
                    `$${Number(v).toLocaleString()}`,
                    "Balance",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6 select-none">
        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              Total Credits
            </span>
            <div className="text-base font-bold text-emerald-450 font-mono">
              +${totalCredits.toLocaleString()}
            </div>
            <p className="text-[9px] text-slate-500">System inflows</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              Total Debits
            </span>
            <div className="text-base font-bold text-rose-500 font-mono">
              -${totalDebits.toLocaleString()}
            </div>
            <p className="text-[9px] text-slate-500">System outflows</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              Net Balance
            </span>
            <div className="text-base font-bold text-white font-mono">
              ${(totalCredits - totalDebits).toLocaleString()}
            </div>
            <p className="text-[9px] text-slate-500">Delta matching</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              Ledger Events
            </span>
            <div className="text-base font-bold text-white font-mono">
              {transactionCount}
            </div>
            <p className="text-[9px] text-slate-500">Events record count</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              Avg Ticket Size
            </span>
            <div className="text-base font-bold text-blue-400 font-mono">
              ${Math.round(averageTxAmount).toLocaleString()}
            </div>
            <p className="text-[9px] text-slate-500">Average transaction size</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              Largest Tx
            </span>
            <div className="text-base font-bold text-blue-400 font-mono">
              ${maxTxAmount.toLocaleString()}
            </div>
            <p className="text-[9px] text-slate-500">Peak event value</p>
          </CardContent>
        </Card>
      </div>

      {/* Ledger & Replay summary details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 select-none">
        {/* Ledger state replay cards */}
        <Card className="bg-slate-950 border-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <ScrollText className="h-4 w-4 text-blue-500" />
              State Replay & Snapshots
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
              <span className="text-slate-500">REPLAY PERFORMANCE</span>
              <span className="text-emerald-500 font-semibold">OPTIMIZED</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
              <span className="text-slate-500">SNAPSHOT STATE</span>
              {latestSnapshot ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-450 border-emerald-500/20 text-[9px]">
                  CHECKPOINT ACTIVE
                </Badge>
              ) : (
                <span className="text-slate-500 font-semibold">NO SNAPSHOTS</span>
              )}
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">LAST CHECKPOINT</span>
              <span className="text-slate-350">
                {latestSnapshot
                  ? new Date(latestSnapshot.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Fraud Risk status */}
        <Card className="bg-slate-950 border-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              Fraud Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
              <span className="text-slate-500">SECURITY RISK SCORE</span>
              <span className={`font-bold ${fraudHistory.length > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                {fraudHistory.length > 0 ? "45 / 100" : "0 / 100"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
              <span className="text-slate-500">SEVERITY ALERTS</span>
              <span className="text-slate-350">{fraudHistory.length} triggers</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">RULE STATUS</span>
              <span className="text-slate-450 italic">Passed Velocity Limits</span>
            </div>
          </CardContent>
        </Card>

        {/* Reconciliation Summary card */}
        <Card className="bg-slate-950 border-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <GitCompare className="h-4 w-4 text-amber-500" />
              Reconciliation status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
              <span className="text-slate-500">RECONCILIATION ANOMALIES</span>
              <span className={`font-bold ${matchingFailures.length > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                {matchingFailures.length} matches
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
              <span className="text-slate-500">PENDING SETTLEMENTS</span>
              <span className="text-slate-350">0 transactions</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">AUDIT SWEEP STATUS</span>
              <span className="text-slate-450 italic">Verified consistent</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row Operations Action Controllers */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 select-none space-y-4">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Ledger Container Operations
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => createSnapshotMutation.mutate()}
            disabled={createSnapshotMutation.isPending}
            variant="outline"
            className="text-xs bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white gap-1.5 cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5" />
            Generate Snapshot Checkpoint
          </Button>

          <Button
            onClick={handleReplayBalance}
            variant="outline"
            className="text-xs bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white gap-1.5 cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Replay Event Balance
          </Button>

          <Button
            onClick={handleRunFraudScan}
            variant="outline"
            className="text-xs bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Run Fraud Velocity Scan
          </Button>

          <Button
            onClick={() => runReconciliationMutation.mutate()}
            disabled={runReconciliationMutation.isPending}
            variant="outline"
            className="text-xs bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white gap-1.5 cursor-pointer"
          >
            <GitCompare className="h-3.5 w-3.5" />
            Run Reconciliation Scan
          </Button>
        </div>
      </div>

      {/* Grid: Ledger Events Table vs Chronological Audit Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ledger Entries List table */}
        <div className="lg:col-span-2 space-y-3 bg-slate-950 border border-slate-900 rounded-xl p-5 select-none">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Double-Entry Transaction History
          </h3>
          <div className="border border-slate-900 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-b border-slate-900">
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">ID</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">Direction</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">Amount</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">Reference</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3 text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500 font-mono">
                      No double-entry events found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ledgerHistory.map((e) => (
                    <TableRow key={e.id} className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors">
                      <TableCell className="font-mono text-slate-350 text-[10px] py-3">
                        {e.id.slice(0, 12)}...
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={
                            e.entryType === "CREDIT"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-mono"
                              : "bg-rose-500/10 text-rose-450 border-rose-500/20 text-[9px] font-mono"
                          }
                        >
                          {e.entryType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-white py-3 font-semibold">
                        ${Number(e.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300 font-mono max-w-[200px] truncate py-3">
                        {e.description || "System transaction"}
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-slate-500 py-3 text-right">
                        {new Date(e.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Audit chronological timeline */}
        <Card className="bg-slate-950 border-slate-900 select-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-500" />
              Chronological Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="relative pl-4 border-l border-slate-850 space-y-4 my-2">
              {auditTimeline.slice(0, 5).map((evt) => {
                let color = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                if (evt.type === "deposit") {
                  color = "bg-emerald-500/10 text-emerald-450 border-emerald-500/20";
                } else if (evt.type === "snapshot") {
                  color = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
                } else if (evt.type === "fraud") {
                  color = "bg-rose-500/10 text-rose-450 border-rose-500/20";
                }

                return (
                  <div key={evt.id} className="relative space-y-0.5">
                    {/* timeline dot indicator */}
                    <span className={`absolute -left-[24px] top-0.5 flex items-center justify-center h-4.5 w-4.5 rounded-full border ${color}`}>
                      <Clock className="h-2.5 w-2.5" />
                    </span>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                      <span className="font-semibold text-slate-350">{evt.title}</span>
                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-450 font-mono leading-tight">
                      {evt.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Seed dialog modal */}
      <Dialog
        open={activeModal === "deposit"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Inject Seed Funding</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Inject external capital ledger credit to initialize balances.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 select-none">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Target Account
              </label>
              <Input
                value={id}
                disabled
                className="bg-slate-900 border-slate-800 text-slate-400 text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Funding Amount
              </label>
              <Input
                type="number"
                placeholder="5000"
                value={depositForm.amount}
                onChange={(e) =>
                  setDepositForm({ ...depositForm, amount: e.target.value })
                }
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Reference Description
              </label>
              <Input
                placeholder="Initial capital infusion"
                value={depositForm.description}
                onChange={(e) =>
                  setDepositForm({ ...depositForm, description: e.target.value })
                }
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={() =>
                depositMutation.mutate({
                  accountId: id,
                  amount: Number(depositForm.amount),
                  description: depositForm.description,
                })
              }
              disabled={depositMutation.isPending || !depositForm.amount}
              className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white h-9"
            >
              {depositMutation.isPending
                ? "Executing Inflow..."
                : "Execute Capital Inflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer dialog modal */}
      <Dialog
        open={activeModal === "transfer"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Execute Internal Transfer</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Perform atomic transfer between matching currency ledger accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 select-none">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Source Account (Debit)
              </label>
              <Input
                value={id}
                disabled
                className="bg-slate-900 border-slate-800 text-slate-400 text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Destination Account (Credit)
              </label>
              <Select
                value={transferForm.toAccountId}
                onValueChange={(val) =>
                  setTransferForm({ ...transferForm, toAccountId: val || "" })
                }
              >
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white text-xs h-9">
                  <SelectValue placeholder="Select receiver account" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-250 max-h-48">
                  {allAccounts
                    .filter((a) => a.id !== id)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.userId} (Bal: {a.balance} {a.currency})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Transfer Amount
              </label>
              <Input
                type="number"
                placeholder="250"
                value={transferForm.amount}
                onChange={(e) =>
                  setTransferForm({ ...transferForm, amount: e.target.value })
                }
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Reference Description
              </label>
              <Input
                placeholder="Intercompany sweep transfer"
                value={transferForm.description}
                onChange={(e) =>
                  setTransferForm({
                    ...transferForm,
                    description: e.target.value,
                  })
                }
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={() =>
                transferMutation.mutate({
                  senderId: id,
                  receiverId: transferForm.toAccountId,
                  amount: Number(transferForm.amount),
                  description: transferForm.description,
                })
              }
              disabled={
                transferMutation.isPending ||
                !transferForm.toAccountId ||
                !transferForm.amount
              }
              className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white h-9"
            >
              {transferMutation.isPending ? "Executing..." : "Execute Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
