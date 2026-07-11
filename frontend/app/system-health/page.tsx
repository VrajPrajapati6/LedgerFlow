"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Server,
  Database,
  RefreshCw,
  Cpu,
  Terminal,
  Activity,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";

export default function SystemHealthPage() {
  const [logs, setLogs] = React.useState<any[]>([
    {
      id: "log-1",
      job: "Snapshot Cron",
      status: "COMPLETED",
      time: "10:30:15",
      desc: "Optimized state checkpoints: written 1 leaf to snapshots table",
    },
    {
      id: "log-2",
      job: "Fraud Velocity Sweep",
      status: "COMPLETED",
      time: "10:29:45",
      desc: "Checked 14 exchange events: risk violations score clean",
    },
    {
      id: "log-3",
      job: "Reconciliation Cron",
      status: "COMPLETED",
      time: "10:28:00",
      desc: "Scanned double-entry records: 0 discrepancy anomalies found",
    },
    {
      id: "log-4",
      job: "Prisma Client Pool Connection",
      status: "ACTIVE",
      time: "10:25:12",
      desc: "Allocated database socket pool: 8 active transactions threads",
    },
  ]);

  const handleTriggerMaintenance = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Flushing redis Cache memory pools and defragmenting disk space...",
        success: "Host node maintenance sweep finalized. System speed fully optimal.",
        error: "Maintenance run failed",
      }
    );

    // Append a log entry
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        job: "Cache Flush Maintenance",
        status: "COMPLETED",
        time: new Date().toLocaleTimeString(),
        desc: "Invalidated redis caches and optimized Prisma database query allocations",
      },
      ...prev,
    ]);
  };

  // Mock API Latency Recharts
  const latencyData = [
    { time: "10:20", latency: 5.2 },
    { time: "10:22", latency: 6.8 },
    { time: "10:24", latency: 4.9 },
    { time: "10:26", latency: 7.1 },
    { time: "10:28", latency: 5.9 },
    { time: "10:30", latency: 6.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 select-none sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans sm:text-3xl">
            System Observability Hub
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            INFRASTRUCTURE HEURISTICS • SRE OPERATIONS CONSOLE
          </p>
        </div>
        <Button
          onClick={handleTriggerMaintenance}
          variant="outline"
          className="text-xs bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white gap-1.5 cursor-pointer select-none"
        >
          <Activity className="h-3.5 w-3.5" />
          Run Health Maintenance Sweep
        </Button>
      </div>

      {/* Nodes Status cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 select-none">
        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                Backend Cluster API
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-0.5 text-xs font-mono">
              <span className="text-white font-bold block">OPERATIONAL</span>
              <span className="text-slate-500 text-[10px]">Uptime: 99.98% • v1.1.2</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                Postgres Database
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-0.5 text-xs font-mono">
              <span className="text-white font-bold block">CONNECTED</span>
              <span className="text-slate-500 text-[10px]">Pool size: 8/20 connections</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                Redis Cache node
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-0.5 text-xs font-mono">
              <span className="text-white font-bold block">CONNECTED</span>
              <span className="text-slate-500 text-[10px]">Hit ratio: 98.4% accuracy</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                Kafka Events Queue
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-0.5 text-xs font-mono">
              <span className="text-white font-bold block">IDLE</span>
              <span className="text-slate-500 text-[10px]">Backlog: 0 unprocessed messages</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SRE Observability metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 select-none">
        {/* Latency graph */}
        <Card className="lg:col-span-2 bg-slate-950 border-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider flex items-center gap-1">
              <HeartPulse className="h-4 w-4 text-emerald-500" />
              API Latency response benchmark (ms)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
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
                  tickFormatter={(v) => `${v}ms`}
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
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorLatency)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Machine Stats */}
        <Card className="bg-slate-950 border-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-blue-500" />
              Hardware Allocations Benchmarks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">HOST CPU LOAD:</span>
                <span className="text-white font-bold">14.2%</span>
              </div>
              <div className="w-full bg-slate-900 border border-slate-850 rounded-full h-1 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "14.2%" }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">MEMORY USAGE:</span>
                <span className="text-white font-bold">124.6 MB / 512 MB</span>
              </div>
              <div className="w-full bg-slate-900 border border-slate-850 rounded-full h-1 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "24.3%" }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">DISK SPACE FOOTPRINT:</span>
                <span className="text-white font-bold">4.2 GB / 40 GB</span>
              </div>
              <div className="w-full bg-slate-900 border border-slate-850 rounded-full h-1 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "10.5%" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduler Activity log list */}
      <Card className="bg-slate-950 border-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-blue-500" />
            Background Scheduler telemetry log streams
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-3 font-mono text-xs max-h-56 overflow-y-auto scrollbar-thin">
            {logs.map((l) => (
              <div
                key={l.id}
                className="flex items-start gap-3 border-b border-slate-900 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-slate-500 shrink-0">{l.time}</span>
                <Badge
                  className="bg-emerald-500/10 text-emerald-450 border-emerald-500/20 text-[9px] shrink-0 font-mono py-0"
                >
                  {l.status}
                </Badge>
                <div className="space-y-0.5">
                  <span className="text-white font-semibold block">{l.job}</span>
                  <p className="text-[10px] text-slate-450 leading-normal">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
