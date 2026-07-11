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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionSummary } from "@/features/transactions/TransactionSummary";
import { TransactionTable } from "@/features/transactions/TransactionTable";
import { TransactionDrawer } from "@/features/transactions/TransactionDrawer";
import { transactionService } from "@/services/api/endpoints";
import { Search, Download, RotateCw, Sliders } from "lucide-react";
import { Transaction } from "@/types";

export default function TransactionsPage() {
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [filterRisk, setFilterRisk] = React.useState<string>("all");
  const [filterMinAmount, setFilterMinAmount] = React.useState("");
  const [filterMaxAmount, setFilterMaxAmount] = React.useState("");

  const [sortField, setSortField] = React.useState<
    "createdAt" | "amount" | "status" | "id"
  >("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = React.useState<
    Record<string, boolean>
  >({
    id: true,
    reference: true,
    sender: true,
    receiver: true,
    amount: true,
    status: true,
    risk: true,
    createdAt: true,
  });

  const {
    data: transactions = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionService.list,
  });

  // Local CSV export helper
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = [
      "Transaction ID",
      "Reference ID",
      "Sender ID",
      "Receiver ID",
      "Amount",
      "Status",
      "Risk Score",
      "Created At",
    ];
    const rows = filtered.map((tx) => [
      tx.id,
      tx.reference || "",
      tx.sender || "",
      tx.receiver || "",
      tx.amount || 0,
      tx.status,
      tx.riskScore || 0,
      tx.createdAt,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field: "createdAt" | "amount" | "status" | "id") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filter logic
  const filtered = transactions.filter((tx) => {
    const s = search.toLowerCase();
    const matchesSearch =
      tx.id.toLowerCase().includes(s) ||
      (tx.reference && tx.reference.toLowerCase().includes(s)) ||
      (tx.sender && tx.sender.toLowerCase().includes(s)) ||
      (tx.receiver && tx.receiver.toLowerCase().includes(s));

    const matchesStatus =
      filterStatus === "all" ||
      tx.status.toLowerCase() === filterStatus.toLowerCase();

    // Risk threshold checks
    let matchesRisk = true;
    const score = tx.riskScore || 0;
    if (filterRisk === "high") {
      matchesRisk = score > 70;
    } else if (filterRisk === "medium") {
      matchesRisk = score > 40 && score <= 70;
    } else if (filterRisk === "low") {
      matchesRisk = score <= 40;
    }

    // Amount range checks
    const amount = tx.amount || 0;
    const matchesMinAmount =
      filterMinAmount === "" || amount >= Number(filterMinAmount);
    const matchesMaxAmount =
      filterMaxAmount === "" || amount <= Number(filterMaxAmount);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRisk &&
      matchesMinAmount &&
      matchesMaxAmount
    );
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    if (sortField === "amount") {
      aVal = a.amount || 0;
      bVal = b.amount || 0;
    }
    if (sortField === "createdAt") {
      aVal = new Date(a.createdAt).getTime();
      bVal = new Date(b.createdAt).getTime();
    }
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  if (isLoading) {
    return <PageLoader />;
  }

  const handleSelectTransaction = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 select-none sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans sm:text-3xl">
            Transactions Registry
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            IMMUTABLE ACCOUNT LEDGER TRANSFERS TELEMETRY LOGS
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Overview summaries */}
      <TransactionSummary transactions={transactions} />

      {/* Toolbar filters block */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between select-none">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-52">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search reference, account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-slate-900 border-slate-850 text-white text-xs h-9"
            />
          </div>

          <Select
            value={filterStatus}
            onValueChange={(val) => setFilterStatus(val || "all")}
          >
            <SelectTrigger className="w-32 bg-slate-900 border-slate-850 text-slate-300 text-xs h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterRisk}
            onValueChange={(val) => setFilterRisk(val || "all")}
          >
            <SelectTrigger className="w-32 bg-slate-900 border-slate-850 text-slate-300 text-xs h-9">
              <SelectValue placeholder="All Risks" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="high">High (&gt;70)</SelectItem>
              <SelectItem value="medium">Medium (40-70)</SelectItem>
              <SelectItem value="low">Low (&lt;40)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Min ($)"
              value={filterMinAmount}
              onChange={(e) => setFilterMinAmount(e.target.value)}
              className="w-20 bg-slate-900 border-slate-855 text-white text-xs h-9"
            />
            <span className="text-slate-600">-</span>
            <Input
              type="number"
              placeholder="Max ($)"
              value={filterMaxAmount}
              onChange={(e) => setFilterMaxAmount(e.target.value)}
              className="w-20 bg-slate-900 border-slate-855 text-white text-xs h-9"
            />
          </div>
        </div>

        {/* Visibility Checklist */}
        <DropdownMenu>
          <DropdownMenuTrigger className="text-xs bg-slate-900 border border-slate-850 rounded px-2.5 h-9 text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer select-none">
            <Sliders className="h-3.5 w-3.5" />
            Columns
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-slate-950 border-slate-800 text-slate-200 w-44"
          >
            <DropdownMenuLabel className="text-xs text-slate-400 font-mono font-normal">
              Toggle Columns
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            {Object.keys(visibleColumns).map((col) => (
              <DropdownMenuCheckboxItem
                key={col}
                checked={visibleColumns[col]}
                onCheckedChange={(checked) =>
                  setVisibleColumns({ ...visibleColumns, [col]: !!checked })
                }
                className="text-xs focus:bg-slate-900 focus:text-white py-1 cursor-pointer"
              >
                {col.toUpperCase()}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Table view */}
      <TransactionTable
        transactions={sorted}
        visibleColumns={visibleColumns}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
        onSelectTransaction={handleSelectTransaction}
      />

      {/* Slideout Inspection Sheet */}
      <TransactionDrawer
        transaction={selectedTx}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        refetchData={refetch}
      />
    </div>
  );
}
