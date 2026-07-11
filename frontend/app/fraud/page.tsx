"use client";

import * as React from "react";
import Link from "next/link";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { fraudService } from "@/services/api/endpoints";
import {
  ShieldAlert,
  RotateCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { FraudAlert } from "@/types";

export default function FraudCenterPage() {
  const [search, setSearch] = React.useState("");
  const [filterSeverity, setFilterSeverity] = React.useState("all");
  const [filterRule, setFilterRule] = React.useState("all");

  const [selectedAlert, setSelectedAlert] = React.useState<FraudAlert | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const {
    data: alerts = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["fraudAlerts"],
    queryFn: fraudService.listAlerts,
  });

  const handleAction = (actionName: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: `Executing action: ${actionName}...`,
        success: `Alert successfully marked as: ${actionName}`,
        error: "Action failed",
      }
    );
    setIsDrawerOpen(false);
  };

  // Filter
  const filtered = alerts.filter((a) => {
    const s = search.toLowerCase();
    const matchesSearch =
      a.id.toLowerCase().includes(s) ||
      a.accountId.toLowerCase().includes(s) ||
      a.transactionId.toLowerCase().includes(s);

    const matchesSeverity =
      filterSeverity === "all" ||
      a.severity.toLowerCase() === filterSeverity.toLowerCase();

    const matchesRule =
      filterRule === "all" ||
      a.triggeredRules.some((r) =>
        r.toLowerCase().includes(filterRule.toLowerCase())
      );

    return matchesSearch && matchesSeverity && matchesRule;
  });

  if (isLoading) {
    return <PageLoader />;
  }

  // Stats Calculations
  const totalAlerts = alerts.length;
  const highRiskCount = alerts.filter((a) => a.severity === "HIGH").length;
  const mediumRiskCount = alerts.filter((a) => a.severity === "MEDIUM").length;
  const criticalTxs = alerts.filter((a) => a.riskScore > 75).length;

  // Recharts Data Aggregation
  const getRuleDistributionData = () => {
    const rulesMap: Record<string, number> = {};
    alerts.forEach((a) => {
      a.triggeredRules.forEach((r) => {
        rulesMap[r] = (rulesMap[r] || 0) + 1;
      });
    });
    const data = Object.entries(rulesMap).map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      count: value,
    }));

    if (data.length === 0) {
      return [
        { name: "Velocity Exceeded", count: 4 },
        { name: "Split Amount Flow", count: 2 },
        { name: "High Amount Limit", count: 1 },
      ];
    }
    return data;
  };

  const getRiskTrendData = () => {
    const datesMap: Record<string, { count: number; totalScore: number }> = {};
    alerts.forEach((a) => {
      const d = new Date(a.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!datesMap[d]) {
        datesMap[d] = { count: 0, totalScore: 0 };
      }
      datesMap[d].count += 1;
      datesMap[d].totalScore += a.riskScore;
    });

    const list = Object.entries(datesMap).map(([date, val]) => ({
      date,
      avgRisk: val.totalScore / val.count,
    }));

    if (list.length === 0) {
      return [
        { date: "Jul 06", avgRisk: 25 },
        { date: "Jul 07", avgRisk: 42 },
        { date: "Jul 08", avgRisk: 30 },
        { date: "Jul 09", avgRisk: 55 },
        { date: "Jul 10", avgRisk: 40 },
        { date: "Jul 11", avgRisk: 68 },
      ];
    }
    return list;
  };

  const ruleData = getRuleDistributionData();
  const trendData = getRiskTrendData();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 select-none sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans sm:text-3xl">
            Fraud Investigation Center
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            RISK AUDIT INTELLIGENCE • SYSTEM SECURITY CONSOLE
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="h-9 w-9 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
          disabled={isRefetching}
        >
          <RotateCw
            className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 select-none">
        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Total Alerts
            </span>
            <div className="text-xl font-bold text-white font-mono">
              {totalAlerts}
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              Anomalies flagged
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              High Risk
            </span>
            <div className="text-xl font-bold text-rose-500 font-mono">
              {highRiskCount}
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              Requires immediate action
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Medium Risk
            </span>
            <div className="text-xl font-bold text-amber-500 font-mono">
              {mediumRiskCount}
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              Awaiting compliance logs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Critical Transactions
            </span>
            <div className="text-xl font-bold text-rose-500 font-mono">
              {criticalTxs}
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              Risk rating score &gt; 75
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Risk Velocity Trend
            </span>
            <div className="text-base font-bold text-emerald-450 font-mono flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Stable
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              Exchange vector check
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Accuracy Rating
            </span>
            <div className="text-xl font-bold text-white font-mono">
              99.8%
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              Operational success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 select-none">
        {/* Risk Trend Chart */}
        <Card className="bg-slate-950 border-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider">
              System Risk Exposure over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#1e293b",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "#cbd5e1",
                  }}
                  formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "Avg Risk"]}
                />
                <Area
                  type="monotone"
                  dataKey="avgRisk"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorRisk)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk by Rule */}
        <Card className="bg-slate-950 border-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider">
              Triggered Risk Parameters Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ruleData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  fontSize={8}
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
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 select-none">
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search Account ID, Alert ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-slate-900 border-slate-850 text-white text-xs h-9"
          />
        </div>

        <Select
          value={filterSeverity}
          onValueChange={(val) => setFilterSeverity(val || "all")}
        >
          <SelectTrigger className="w-36 bg-slate-900 border-slate-850 text-slate-300 text-xs h-9">
            <SelectValue placeholder="All Severities" />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="HIGH">High Risk</SelectItem>
            <SelectItem value="MEDIUM">Medium Risk</SelectItem>
            <SelectItem value="LOW">Low Risk</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterRule}
          onValueChange={(val) => setFilterRule(val || "all")}
        >
          <SelectTrigger className="w-36 bg-slate-900 border-slate-850 text-slate-300 text-xs h-9">
            <SelectValue placeholder="All Rules" />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
            <SelectItem value="all">All Rules</SelectItem>
            <SelectItem value="VELOCITY">Velocity check</SelectItem>
            <SelectItem value="LIMIT">Threshold check</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts Table */}
      <div className="border border-slate-900 rounded-lg overflow-hidden select-none">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-b border-slate-900">
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Alert ID
              </TableHead>
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Transaction ID
              </TableHead>
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Account ID
              </TableHead>
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Risk Score
              </TableHead>
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Severity
              </TableHead>
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Triggered Rules
              </TableHead>
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3 text-right">
                Commit Time
              </TableHead>
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-xs text-slate-500 font-mono bg-slate-950/20"
                >
                  No active risk alerts recorded.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow
                  key={a.id}
                  className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors"
                >
                  <TableCell className="font-mono text-slate-200 text-xs py-3 max-w-[120px] truncate">
                    {a.id}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 py-3 max-w-[110px] truncate">
                    {a.transactionId}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 py-3 max-w-[110px] truncate">
                    {a.accountId}
                  </TableCell>
                  <TableCell className="py-3 font-mono">
                    <span
                      className={`font-semibold text-xs ${
                        a.riskScore > 70
                          ? "text-rose-500"
                          : a.riskScore > 40
                          ? "text-amber-500"
                          : "text-slate-400"
                      }`}
                    >
                      {a.riskScore}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      className={
                        a.severity === "HIGH"
                          ? "bg-rose-500/10 text-rose-450 border-rose-500/20 text-[9px] font-mono"
                          : a.severity === "MEDIUM"
                          ? "bg-amber-500/10 text-amber-450 border-amber-500/20 text-[9px] font-mono"
                          : "bg-slate-500/10 text-slate-450 border-slate-500/20 text-[9px] font-mono"
                      }
                    >
                      {a.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-400 max-w-[180px] truncate py-3">
                    {a.triggeredRules.join(", ")}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-500 py-3 text-right">
                    {new Date(a.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button
                      onClick={() => {
                        setSelectedAlert(a);
                        setIsDrawerOpen(true);
                      }}
                      variant="outline"
                      className="h-7 px-2 text-[10px] bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white gap-1 cursor-pointer"
                    >
                      Inspect Risk
                      <ArrowRight className="h-3 w-3 text-slate-550" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Investigation Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        {selectedAlert && (
          <SheetContent className="bg-slate-950 border-slate-900 text-slate-200 w-full sm:max-w-md overflow-y-auto scrollbar-thin select-none">
            <SheetHeader className="pb-4 border-b border-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                  Risk telemetry alert
                </span>
                <Badge
                  className={
                    selectedAlert.severity === "HIGH"
                      ? "bg-rose-500/10 text-rose-450 border-rose-500/20 text-[9px] font-mono"
                      : "bg-amber-500/10 text-amber-450 border-amber-500/20 text-[9px] font-mono"
                  }
                >
                  {selectedAlert.severity}
                </Badge>
              </div>
              <SheetTitle className="text-white text-base font-mono mt-2">
                Alert: {selectedAlert.id.slice(0, 16)}...
              </SheetTitle>
              <SheetDescription className="text-slate-400 text-xs font-mono">
                Flagged at: {new Date(selectedAlert.createdAt).toLocaleString()}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-5">
              {/* Risk scores */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">ACCUMULATED RISK SCORE:</span>
                <span
                  className={`text-lg font-bold ${
                    selectedAlert.riskScore > 70
                      ? "text-rose-500"
                      : "text-amber-500"
                  }`}
                >
                  {selectedAlert.riskScore} / 100
                </span>
              </div>

              {/* Account details */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Details
                </h4>
                <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-lg space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ACCOUNT ID:</span>
                    <Link
                      href={`/accounts/${selectedAlert.accountId}`}
                      className="text-blue-400 hover:underline"
                    >
                      {selectedAlert.accountId.slice(0, 16)}...
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TRANSACTION ID:</span>
                    <span className="text-slate-300">
                      {selectedAlert.transactionId.slice(0, 16)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Triggered rules details */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Triggered Security Parameters
                </h4>
                <div className="space-y-2">
                  {selectedAlert.triggeredRules.map((rule) => (
                    <div
                      key={rule}
                      className="bg-rose-950/10 border border-rose-900/30 p-3 rounded-lg text-xs font-mono space-y-1"
                    >
                      <span className="text-rose-400 font-semibold block uppercase">
                        {rule}
                      </span>
                      <p className="text-[10px] text-slate-450 leading-tight">
                        Exchange values violated default operational velocity checking limit thresholds.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 border-t border-slate-900 pt-4 select-none">
                <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Investigation actions
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleAction("Ignore")}
                    variant="outline"
                    className="text-[10px] h-8 bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1 text-slate-500" />
                    Ignore
                  </Button>
                  <Button
                    onClick={() => handleAction("Reviewed")}
                    variant="outline"
                    className="text-[10px] h-8 bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAction("Escalate")}
                    className="text-[10px] h-8 bg-rose-600 hover:bg-rose-500 text-white gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-white" />
                    Escalate
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
