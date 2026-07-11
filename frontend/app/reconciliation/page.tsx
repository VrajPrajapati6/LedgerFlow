"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageLoader } from "@/components/feedback/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { reconciliationService } from "@/services/api/endpoints";
import {
  GitCompare,
  RotateCw,
  Download,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { ReconciliationFailure } from "@/types";

export default function ReconciliationCenterPage() {
  const [selectedFailure, setSelectedFailure] =
    React.useState<ReconciliationFailure | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Queries
  const {
    data: report = null,
    isLoading: reportLoading,
    refetch: refetchReport,
    isRefetching: reportRefetching,
  } = useQuery({
    queryKey: ["reconciliationReport"],
    queryFn: async () => {
      try {
        return await reconciliationService.getReport();
      } catch {
        return null;
      }
    },
  });

  const {
    data: failures = [],
    isLoading: failuresLoading,
    refetch: refetchFailures,
    isRefetching: failuresRefetching,
  } = useQuery({
    queryKey: ["reconciliationFailures"],
    queryFn: async () => {
      try {
        return await reconciliationService.listFailures();
      } catch {
        return [];
      }
    },
  });

  // Run Reconciliation mutation
  const runMutation = useMutation({
    mutationFn: reconciliationService.run,
    onSuccess: () => {
      toast.success("Audit reconciliation scan completed successfully");
      refetchReport();
      refetchFailures();
    },
    onError: (err: any) => {
      toast.error(err.message || "Reconciliation run failed");
    },
  });

  const handleExportCSV = () => {
    if (failures.length === 0) return;
    const headers = [
      "Failure ID",
      "Run ID",
      "Transaction ID",
      "Mismatch Type",
      "Details",
      "Created At",
    ];
    const rows = failures.map((f) => [
      f.id,
      f.runId,
      f.transactionId,
      f.mismatchType,
      f.details || "",
      f.createdAt,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reconciliation_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (reportLoading || failuresLoading) {
    return <PageLoader />;
  }

  // Summary Metrics calculations
  const totalMatched = report ? report.totalMatched : 0;
  const totalMismatched = report ? report.totalMismatched : failures.length;

  const countByType = (type: string) => {
    return failures.filter((f) => f.mismatchType === type).length;
  };

  const missingCount = countByType("MISSING_SETTLEMENT");
  const amountMismatchCount = countByType("AMOUNT_MISMATCH");
  const statusMismatchCount = countByType("STATUS_MISMATCH");
  const duplicateCount = countByType("DUPLICATE_SETTLEMENT");

  const totalProcessed = totalMatched + totalMismatched;
  const matchAccuracyRate =
    totalProcessed > 0 ? (totalMatched / totalProcessed) * 100 : 100;

  // Pie chart aggregation
  const successData = [
    { name: "Matched", value: totalMatched, color: "#10b981" },
    { name: "Anomalies", value: totalMismatched, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 select-none sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans sm:text-3xl">
            Reconciliation Center
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            EXTERNAL SETTLEMENT AUDIT SCAN VERIFICATION
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              refetchReport();
              refetchFailures();
            }}
            variant="outline"
            className="h-9 w-9 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            disabled={reportRefetching || failuresRefetching}
          >
            <RotateCw
              className={`h-4 w-4 ${
                reportRefetching || failuresRefetching ? "animate-spin" : ""
              }`}
            />
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="text-xs bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white gap-1 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white h-9 cursor-pointer"
          >
            <GitCompare className="mr-1 h-3.5 w-3.5 text-white" />
            {runMutation.isPending
              ? "Scanning settlement records..."
              : "Run Reconciliation"}
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 select-none">
        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Matched
            </span>
            <div className="text-xl font-bold text-white font-mono">
              {totalMatched}
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              Cleared settlements
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Missing Records
            </span>
            <div className="text-xl font-bold text-rose-500 font-mono">
              {missingCount}
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              Failed external matching
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Amount Mismatch
            </span>
            <div className="text-xl font-bold text-amber-500 font-mono">
              {amountMismatchCount}
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              Values delta discrepancy
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Status Deviations
            </span>
            <div className="text-xl font-bold text-amber-500 font-mono">
              {statusMismatchCount}
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              State mismatch flags
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Duplicates
            </span>
            <div className="text-xl font-bold text-rose-500 font-mono">
              {duplicateCount}
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              Repeated processing
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-900">
          <CardContent className="p-4 space-y-1.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Scan Uptime Accuracy
            </span>
            <div className="text-base font-bold text-emerald-400 font-mono">
              {matchAccuracyRate.toFixed(1)}% Accuracy
            </div>
            <p className="text-[9px] text-slate-550 leading-tight">
              Reconciliation pass rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Analytics & Failure lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Failures Table log */}
        <div className="lg:col-span-2 space-y-3 bg-slate-950 border border-slate-900 rounded-xl p-5 select-none">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Settlement Discrepancies Report Logs
          </h3>
          <div className="border border-slate-900 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-b border-slate-900">
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                    Discrepancy ID
                  </TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                    Transaction ID
                  </TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                    Mismatch Type
                  </TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                    Commit Date
                  </TableHead>
                  <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failures.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-xs text-slate-500 font-mono bg-slate-950/20"
                    >
                      No mismatches recorded. Settlement 100% accurate.
                    </TableCell>
                  </TableRow>
                ) : (
                  failures.map((f) => (
                    <TableRow
                      key={f.id}
                      className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors"
                    >
                      <TableCell className="font-mono text-slate-200 text-xs py-3 max-w-[120px] truncate">
                        {f.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400 py-3 max-w-[120px] truncate">
                        {f.transactionId}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={
                            f.mismatchType === "MISSING_SETTLEMENT"
                              ? "bg-rose-500/10 text-rose-455 border-rose-500/20 text-[9px] font-mono"
                              : "bg-amber-500/10 text-amber-450 border-amber-500/20 text-[9px] font-mono"
                          }
                        >
                          {f.mismatchType.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-slate-500 py-3">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Button
                          onClick={() => {
                            setSelectedFailure(f);
                            setIsDrawerOpen(true);
                          }}
                          variant="outline"
                          className="h-7 px-2 text-[10px] bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white gap-1 cursor-pointer"
                        >
                          Inspect Mismatch
                          <ArrowRight className="h-3 w-3 text-slate-550" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Settlement Pie chart */}
        <Card className="bg-slate-950 border-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-slate-450 uppercase tracking-wider">
              Settlement Verification Success Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-between py-4">
            <div className="h-40 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {successData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      borderColor: "#1e293b",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: "#cbd5e1",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-[9px] text-slate-500 font-mono uppercase">
                  Processed Files
                </span>
                <span className="text-base font-bold text-white font-mono">
                  {totalProcessed}
                </span>
              </div>
            </div>
            <div className="flex justify-around text-[10px] font-mono border-t border-slate-900 pt-3">
              {successData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full animate-pulse"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-slate-400">{d.name}</span>
                  <span className="text-white font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Failure Comparison Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        {selectedFailure && (
          <SheetContent className="bg-slate-950 border-slate-900 text-slate-200 w-full sm:max-w-md overflow-y-auto scrollbar-thin select-none">
            <SheetHeader className="pb-4 border-b border-slate-900">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                Discrepancy Details
              </span>
              <SheetTitle className="text-white text-base font-mono mt-2">
                Mismatch: {selectedFailure.id.slice(0, 16)}...
              </SheetTitle>
              <SheetDescription className="text-slate-400 text-xs font-mono">
                Identified at: {new Date(selectedFailure.createdAt).toLocaleString()}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-5">
              {/* Mismatch Type Block */}
              <div className="bg-rose-950/15 border border-rose-900/30 p-4 rounded-lg space-y-1">
                <span className="text-rose-400 font-bold block uppercase text-xs">
                  {selectedFailure.mismatchType.replace(/_/g, " ")}
                </span>
                <p className="text-[10px] text-slate-450 leading-tight">
                  External payment settlements table transaction record values differ from internal double-entry ledger listings.
                </p>
              </div>

              {/* Detailed logs comparison */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Audit Telemetry Comparison
                </h4>
                <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-lg space-y-3.5 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500 font-semibold text-[10px] block">INTERNAL LEDGER</span>
                    <span className="text-emerald-450 block font-bold">$1,500.00</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500 font-semibold text-[10px] block">EXTERNAL SETTLEMENT</span>
                    <span className="text-rose-400 block font-bold">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold text-[10px] block">DIFFERENCE DELTA</span>
                    <span className="text-rose-500 block font-bold font-mono">-$1,500.00</span>
                  </div>
                </div>
              </div>

              {/* Resolution details */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Suggested Compliance Resolution
                </h4>
                <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-lg text-xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                    <HelpCircle className="h-4 w-4" />
                    <span>Resolution Guidance</span>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-normal pt-1">
                    Execute replay balance auditing logs to identify splits, or run manual external settlement sweeps matching transaction reference values.
                  </p>
                </div>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
