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
import { CreateAccountDialog } from "@/features/accounts/CreateAccountDialog";
import { AccountsTable } from "@/features/accounts/AccountsTable";
import { AccountsGrid } from "@/features/accounts/AccountsGrid";
import { accountService } from "@/services/api/endpoints";
import {
  Plus,
  Search,
  Grid,
  List,
  Download,
  RotateCw,
  SlidersHorizontal,
  Eye,
  Sliders,
} from "lucide-react";
import { Account } from "@/types";

export default function AccountsPage() {
  const [view, setView] = React.useState<"list" | "grid">("list");
  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState<string>("all");
  const [filterCurrency, setFilterCurrency] = React.useState<string>("all");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");

  const [sortField, setSortField] = React.useState<
    "id" | "balance" | "accountType" | "status" | "createdAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = React.useState<
    Record<string, boolean>
  >({
    id: true,
    userId: true,
    accountType: true,
    currency: true,
    balance: true,
    status: true,
    risk: true,
    createdAt: true,
  });

  const {
    data: accounts = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  // Export to CSV local action
  const handleExportCSV = () => {
    if (accounts.length === 0) return;
    const headers = [
      "Account ID",
      "User ID",
      "Type",
      "Currency",
      "Balance",
      "Status",
      "Created At",
    ];
    const rows = accounts.map((a) => [
      a.id,
      a.userId,
      a.accountType,
      a.currency,
      a.balance || 0,
      a.status,
      a.createdAt,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ledger_accounts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (
    field: "id" | "balance" | "accountType" | "status" | "createdAt"
  ) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filter
  const filtered = accounts.filter((a) => {
    const s = search.toLowerCase();
    const matchesSearch =
      a.id.toLowerCase().includes(s) || a.userId.toLowerCase().includes(s);

    const matchesType =
      filterType === "all" ||
      a.accountType.toLowerCase() === filterType.toLowerCase();

    const matchesCurrency =
      filterCurrency === "all" ||
      a.currency.toLowerCase() === filterCurrency.toLowerCase();

    const matchesStatus =
      filterStatus === "all" ||
      a.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesType && matchesCurrency && matchesStatus;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    if (sortField === "balance") {
      aVal = a.balance || 0;
      bVal = b.balance || 0;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 select-none sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans sm:text-3xl">
            Accounts Registry
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            OPERATING LEDGER CONTAINERS TELEMETRY • {accounts.length} PROVISIONED
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
            className="text-xs bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white gap-1 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white h-9 cursor-pointer"
          >
            <Plus className="mr-1 h-3.5 w-3.5 text-white shrink-0" />
            Provision Account
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between select-none">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search ID, User ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-slate-900 border-slate-850 text-white text-xs h-9"
            />
          </div>

          <Select value={filterType} onValueChange={(val) => setFilterType(val || "all")}>
            <SelectTrigger className="w-36 bg-slate-900 border-slate-850 text-slate-300 text-xs h-9">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="SAVINGS">Savings</SelectItem>
              <SelectItem value="CHECKING">Checking</SelectItem>
              <SelectItem value="OPERATING">Operating</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCurrency} onValueChange={(val) => setFilterCurrency(val || "all")}>
            <SelectTrigger className="w-32 bg-slate-900 border-slate-850 text-slate-300 text-xs h-9">
              <SelectValue placeholder="All Currencies" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "all")}>
            <SelectTrigger className="w-32 bg-slate-900 border-slate-850 text-slate-300 text-xs h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Switches & Column visibility */}
        <div className="flex items-center gap-2">
          {/* Column Visibility Dropdown */}
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
                  {col.replace(/([A-Z])/g, " $1").toUpperCase()}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex rounded-md bg-slate-900 border border-slate-850 p-0.5">
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded transition-colors ${
                view === "list"
                  ? "bg-slate-800 text-blue-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded transition-colors ${
                view === "grid"
                  ? "bg-slate-800 text-blue-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {view === "list" ? (
        <AccountsTable
          accounts={sorted}
          visibleColumns={visibleColumns}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />
      ) : (
        <AccountsGrid accounts={sorted} />
      )}

      {/* Create Account Modal Form */}
      <CreateAccountDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
