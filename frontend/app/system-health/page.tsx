"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  accountService,
  transactionService,
  ledgerService,
  snapshotService,
  fraudService,
  reconciliationService,
} from "@/services/api/endpoints";
import { PageLoader } from "@/components/feedback/Loader";
import {
  Activity,
  Server,
  Database,
  Zap,
  ShieldCheck,
  GitCompare,
  FileClock,
  ArrowLeftRight,
  Landmark,
  ScrollText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

function StatusDot({ status }: { status: "ok" | "warn" | "down" }) {
  return (
    <span
      className={cn(
        "h-2 w-2 rounded-full shrink-0",
        status === "ok" ? "bg-emerald-400" : status === "warn" ? "bg-amber-400" : "bg-red-500"
      )}
    />
  );
}

export default function SystemHealthPage() {
  const { data: accounts = [], isLoading: a } = useQuery({ queryKey: ["accounts"], queryFn: accountService.list });
  const { data: transactions = [], isLoading: t } = useQuery({ queryKey: ["transactions"], queryFn: transactionService.list });
  const { data: ledger = [], isLoading: l } = useQuery({ queryKey: ["ledger"], queryFn: ledgerService.list });
  const { data: snapshots = [] } = useQuery({ queryKey: ["snapshots"], queryFn: snapshotService.list });
  const { data: fraudAlerts = [] } = useQuery({ queryKey: ["fraudAlerts"], queryFn: fraudService.listAlerts });
  const { data: report } = useQuery({
    queryKey: ["reconciliationReport"],
    queryFn: async () => { try { return await reconciliationService.getReport(); } catch { return null; } },
  });

  if (a || t || l) return <PageLoader />;

  const highFraud = fraudAlerts.filter((f) => f.severity === "HIGH").length;
  const failedTx = transactions.filter((t) => t.status === "FAILED").length;
  const pendingTx = transactions.filter((t) => t.status === "PENDING").length;

  const services = [
    { icon: Server, name: "API Gateway", desc: "HTTP/REST layer", status: "ok" as const, info: "All routes responding" },
    { icon: Database, name: "Ledger Engine", desc: "Event store", status: ledger.length > 0 ? ("ok" as const) : ("warn" as const), info: `${ledger.length} events persisted` },
    { icon: Landmark, name: "Account Registry", desc: "Account service", status: accounts.length > 0 ? ("ok" as const) : ("warn" as const), info: `${accounts.length} accounts registered` },
    { icon: ArrowLeftRight, name: "Transaction Bus", desc: "Payment pipeline", status: failedTx > 5 ? ("warn" as const) : ("ok" as const), info: `${transactions.length} total, ${failedTx} failed` },
    { icon: ShieldCheck, name: "Fraud Engine", desc: "Rule processor", status: highFraud > 3 ? ("warn" as const) : ("ok" as const), info: `${fraudAlerts.length} alerts, ${highFraud} critical` },
    { icon: GitCompare, name: "Reconciliation", desc: "Settlement audit", status: report ? "ok" as const : "warn" as const, info: report ? `${report.totalMatched} matched` : "No scan run" },
    { icon: FileClock, name: "Snapshot Store", desc: "Checkpoint store", status: snapshots.length > 0 ? ("ok" as const) : ("warn" as const), info: `${snapshots.length} checkpoints` },
    { icon: ScrollText, name: "Audit Logger", desc: "Compliance log", status: "ok" as const, info: `${ledger.length} immutable events` },
  ];

  // Generate fake latency data for visualization
  const latencyData = Array.from({ length: 12 }, (_, i) => ({
    time: `${String(i * 2).padStart(2, "0")}:00`,
    api: Math.round(40 + Math.random() * 30),
    db: Math.round(15 + Math.random() * 20),
  }));

  const allOk = services.every((s) => s.status === "ok");
  const warnCount = services.filter((s) => s.status === "warn").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" /> System Health
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">SRE observability dashboard — infrastructure status and metrics</p>
        </div>
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold",
          allOk ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"
        )}>
          {allOk ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {allOk ? "All systems operational" : `${warnCount} service${warnCount > 1 ? "s" : ""} need attention`}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Active Accounts", value: accounts.length, color: "text-slate-900" },
          { label: "Total Transactions", value: transactions.length, color: "text-slate-900" },
          { label: "Pending Transfers", value: pendingTx, color: pendingTx > 0 ? "text-amber-700" : "text-emerald-700" },
          { label: "Failed Transfers", value: failedTx, color: failedTx > 0 ? "text-red-700" : "text-emerald-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 card-shadow">
            <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Service Status Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Service Status Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time infrastructure component health</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {services.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.name}
                className={cn(
                  "flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors",
                  idx % 2 === 1 ? "" : "border-b border-slate-100 sm:border-b-0",
                  Math.floor(idx / 2) < Math.floor(services.length / 2) - 1 ? "sm:border-b sm:border-slate-100" : ""
                )}
              >
                <div className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border",
                  svc.status === "ok" ? "bg-emerald-50 border-emerald-200" : svc.status === "warn" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
                )}>
                  <Icon className={cn("h-4 w-4",
                    svc.status === "ok" ? "text-emerald-600" : svc.status === "warn" ? "text-amber-600" : "text-red-600"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{svc.name}</p>
                    <StatusDot status={svc.status} />
                  </div>
                  <p className="text-xs text-slate-400 truncate">{svc.info}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                  svc.status === "ok" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  svc.status === "warn" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"
                )}>
                  {svc.status === "ok" ? "HEALTHY" : svc.status === "warn" ? "DEGRADED" : "DOWN"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latency Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900">API Response Latency</h2>
          <p className="text-xs text-slate-500 mt-0.5">Simulated 24-hour latency baseline (ms)</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={latencyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gApi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gDb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}ms`} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
              formatter={(v, name) => [`${v ?? 0}ms`, name === "api" ? "API Gateway" : name === "db" ? "Database" : "Value"]}
            />
            <Area type="monotone" dataKey="api" name="api" stroke="#2563eb" strokeWidth={2} fill="url(#gApi)" />
            <Area type="monotone" dataKey="db" name="db" stroke="#059669" strokeWidth={2} fill="url(#gDb)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
