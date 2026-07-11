"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Database, RefreshCw, Server } from "lucide-react";

export function SystemHealthCards() {
  const healths = [
    {
      title: "Backend Cluster",
      status: "Healthy",
      metric: "Uptime: 99.98%",
      latency: "Latency: 6.4ms",
      indicator: "bg-emerald-500",
      icon: Cpu,
    },
    {
      title: "Database Node",
      status: "Connected",
      metric: "Pool active: 8/20",
      latency: "Disk usage: 14%",
      indicator: "bg-emerald-500",
      icon: Database,
    },
    {
      title: "Redis State Store",
      status: "Connected",
      metric: "Hit rate: 98.2%",
      latency: "Memory: 12.8MB",
      indicator: "bg-emerald-500",
      icon: RefreshCw,
    },
    {
      title: "Kafka Event Stream",
      status: "Idle",
      metric: "Backlog: 0 messages",
      latency: "Throughput: 0 msg/s",
      indicator: "bg-emerald-500",
      icon: Server,
    },
  ];

  return (
    <Card className="bg-slate-950 border-slate-900 select-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Infrastructure Observability (Live)
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4 p-5">
        {healths.map((h) => {
          const Icon = h.icon;
          return (
            <div
              key={h.title}
              className="bg-slate-900 border border-slate-800 rounded p-3.5 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${h.indicator} animate-pulse`}
                  />
                  <span className="text-[10px] font-mono text-white font-semibold uppercase">
                    {h.title}
                  </span>
                </div>
                <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              </div>
              <div className="space-y-0.5 text-[9px] font-mono text-slate-500 leading-normal">
                <span className="text-slate-350 block">{h.status}</span>
                <span className="block">{h.metric}</span>
                <span className="block">{h.latency}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
