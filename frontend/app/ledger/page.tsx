"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLoader } from "@/components/feedback/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LedgerSummary } from "@/features/ledger/LedgerSummary";
import { LedgerTable } from "@/features/ledger/LedgerTable";
import { LedgerDrawer } from "@/features/ledger/LedgerDrawer";
import { ReplaySimulator } from "@/features/ledger/ReplaySimulator";
import { BalanceInspector } from "@/features/ledger/BalanceInspector";
import { LedgerTimelineChart } from "@/features/ledger/LedgerTimelineChart";
import { TransactionDrawer } from "@/features/transactions/TransactionDrawer";
import { ledgerService, snapshotService } from "@/services/api/endpoints";
import { Search, Download, RotateCw } from "lucide-react";
import { LedgerEntry, Transaction } from "@/types";

export default function LedgerExplorerPage() {
  const [search, setSearch] = React.useState("");
  const [filterAccount, setFilterAccount] = React.useState("");
  const [filterTx, setFilterTx] = React.useState("");
  const [filterType, setFilterType] = React.useState<string>("all");

  const [sortField, setSortField] = React.useState<"createdAt" | "amount" | "id">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = React.useState<"desc" | "asc">("desc");

  // Selection states
  const [selectedEntry, setSelectedEntry] = React.useState<LedgerEntry | null>(
    null
  );
  const [isLedgerDrawerOpen, setIsLedgerDrawerOpen] = React.useState(false);

  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);
  const [isTxDrawerOpen, setIsTxDrawerOpen] = React.useState(false);

  const {
    data: entries = [],
    isLoading: ledgerLoading,
    refetch: refetchLedger,
    isRefetching,
  } = useQuery({
    queryKey: ["ledger"],
    queryFn: ledgerService.list,
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["snapshots"],
    queryFn: snapshotService.list,
  });

  // Local CSV export
  const handleExportCSV = () => {
    if (entries.length === 0) return;
    const headers = [
      "Ledger ID",
      "Transaction ID",
      "Account ID",
      "Entry Type",
      "Amount",
      "Description",
      "Created At",
    ];
    const rows = filtered.map((e) => [
      e.id,
      e.transactionId,
      e.accountId,
      e.entryType,
      e.amount,
      e.description || "",
      e.createdAt,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ledger_entries_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field: "createdAt" | "amount" | "id") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filter
  const filtered = entries.filter((e) => {
    const s = search.toLowerCase();
    const matchesSearch =
      e.id.toLowerCase().includes(s) ||
      (e.description && e.description.toLowerCase().includes(s));

    const matchesAccount =
      filterAccount === "" ||
      e.accountId.toLowerCase().includes(filterAccount.toLowerCase());

    const matchesTx =
      filterTx === "" ||
      e.transactionId.toLowerCase().includes(filterTx.toLowerCase());

    const matchesType =
      filterType === "all" ||
      e.entryType.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesAccount && matchesTx && matchesType;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    if (sortField === "amount") {
      aVal = Number(a.amount);
      bVal = Number(b.amount);
    }
    if (sortField === "createdAt") {
      aVal = new Date(a.createdAt).getTime();
      bVal = new Date(b.createdAt).getTime();
    }
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  if (ledgerLoading) {
    return <PageLoader />;
  }

  // Cross links navigator action
  const handleInspectTransaction = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsTxDrawerOpen(true);
  };

  const handleSelectEvent = (e: LedgerEntry) => {
    setSelectedEntry(e);
    setIsLedgerDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Header */}
      <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 select-none sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans sm:text-3xl">
            Ledger Explorer
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            IMMUTABLE DOUBLE-ENTRY EVENT SOURCED JOURNAL TELEMETRY LOGS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetchLedger()}
            variant="outline"
            className="h-9 w-9 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            disabled={isRefetching}
          >
            <RotateCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
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
        </div>
      </div>

      {/* Stats row overview */}
      <LedgerSummary entries={entries} snapshotsCount={snapshots.length} />

      {/* Toolbar filters */}
      <div className="flex flex-wrap items-center gap-2.5 select-none">
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search details, event ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-slate-900 border-slate-850 text-white text-xs h-9"
          />
        </div>

        <Input
          placeholder="Filter Account ID"
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          className="w-full sm:w-40 bg-slate-900 border-slate-850 text-white text-xs h-9"
        />

        <Input
          placeholder="Filter Tx ID"
          value={filterTx}
          onChange={(e) => setFilterTx(e.target.value)}
          className="w-full sm:w-40 bg-slate-900 border-slate-850 text-white text-xs h-9"
        />

        <Select
          value={filterType}
          onValueChange={(val) => setFilterType(val || "all")}
        >
          <SelectTrigger className="w-32 bg-slate-900 border-slate-850 text-slate-300 text-xs h-9">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="CREDIT">Credits (+)</SelectItem>
            <SelectItem value="DEBIT">Debits (-)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Grid: left column datatable, right column side widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Flat Entries List Table */}
        <div className="lg:col-span-2">
          <LedgerTable
            entries={sorted}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
            onSelectEvent={handleSelectEvent}
          />
        </div>

        {/* Simulators, Inspectors, and Timeline visualizers */}
        <div className="space-y-6">
          <ReplaySimulator />
          <BalanceInspector />
          <LedgerTimelineChart />
        </div>
      </div>

      {/* Slideout details drawers */}
      <LedgerDrawer
        entry={selectedEntry}
        open={isLedgerDrawerOpen}
        onOpenChange={setIsLedgerDrawerOpen}
        onInspectTransaction={handleInspectTransaction}
        allEntries={entries}
      />

      <TransactionDrawer
        transaction={selectedTx}
        open={isTxDrawerOpen}
        onOpenChange={setIsTxDrawerOpen}
        refetchData={refetchLedger}
      />
    </div>
  );
}
