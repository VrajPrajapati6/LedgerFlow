"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Transaction } from "@/types";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

interface RecentTransactionsTableProps {
  transactions: Transaction[];
}

export function RecentTransactionsTable({
  transactions = [],
}: RecentTransactionsTableProps) {
  const [search, setSearch] = React.useState("");
  const [sortField, setSortField] = React.useState<
    "createdAt" | "amount" | "status"
  >("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const limit = 5;

  const handleSort = (field: "createdAt" | "amount" | "status") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filter
  const filtered = transactions.filter((tx) => {
    const s = search.toLowerCase();
    return (
      tx.id.toLowerCase().includes(s) ||
      (tx.reference && tx.reference.toLowerCase().includes(s)) ||
      (tx.sender && tx.sender.toLowerCase().includes(s)) ||
      (tx.receiver && tx.receiver.toLowerCase().includes(s))
    );
  });

  // Sort
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

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / limit));
  const paginated = sorted.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-3 bg-slate-950 border border-slate-900 rounded-xl p-5 select-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          System Transaction Logs
        </h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search reference, account ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8 bg-slate-900 border-slate-800 text-white text-xs h-9 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="border border-slate-900 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-b border-slate-900">
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                ID / Reference
              </TableHead>
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Sender
              </TableHead>
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Receiver
              </TableHead>
              <TableHead
                onClick={() => handleSort("amount")}
                className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200"
              >
                <span className="flex items-center gap-1">
                  Amount <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead
                onClick={() => handleSort("status")}
                className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200"
              >
                <span className="flex items-center gap-1">
                  Status <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Risk
              </TableHead>
              <TableHead
                onClick={() => handleSort("createdAt")}
                className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200 text-right"
              >
                <span className="flex items-center gap-1 justify-end">
                  Timestamp <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-xs text-slate-500 font-mono"
                >
                  No transaction telemetry matches.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors"
                >
                  <TableCell className="font-mono text-slate-200 py-3 max-w-[150px] truncate">
                    <span className="block font-medium">
                      {tx.reference || "DEPOSIT"}
                    </span>
                    <span className="text-[9px] text-slate-500 block truncate">
                      {tx.id}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 py-3 max-w-[120px] truncate">
                    {tx.sender || (
                      <span className="text-slate-600 text-[10px] uppercase font-semibold">
                        External Seed
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 py-3 max-w-[120px] truncate">
                    {tx.receiver || <span className="text-slate-600">--</span>}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-white py-3 font-semibold">
                    ${(tx.amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={
                        tx.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]"
                          : tx.status === "FAILED"
                          ? "bg-rose-500/10 text-rose-450 border-rose-500/20 text-[9px]"
                          : "bg-amber-500/10 text-amber-450 border-amber-500/20 text-[9px]"
                      }
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <span
                      className={`font-mono font-semibold text-xs ${
                        (tx.riskScore || 0) > 70
                          ? "text-rose-500"
                          : (tx.riskScore || 0) > 40
                          ? "text-amber-500"
                          : "text-slate-500"
                      }`}
                    >
                      {tx.riskScore || 0}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-500 py-3 text-right">
                    {new Date(tx.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-2">
        <span>
          Showing {Math.min(sorted.length, (page - 1) * limit + 1)}-
          {Math.min(sorted.length, page * limit)} of {sorted.length}{" "}
          transactions
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="flex items-center justify-center h-7 w-7 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="flex items-center justify-center h-7 w-7 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
