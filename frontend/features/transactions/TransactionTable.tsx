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
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types";
import { ArrowUpDown, Eye, ArrowRight } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  visibleColumns: Record<string, boolean>;
  onSort: (field: "createdAt" | "amount" | "status" | "id") => void;
  sortField: string;
  sortOrder: "asc" | "desc";
  onSelectTransaction: (tx: Transaction) => void;
}

export function TransactionTable({
  transactions = [],
  visibleColumns,
  onSort,
  sortField,
  sortOrder,
  onSelectTransaction,
}: TransactionTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-mono">
            SUCCESS
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-rose-500/10 text-rose-450 border-rose-500/20 text-[9px] font-mono">
            FAILED
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-450 border-amber-500/20 text-[9px] font-mono">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="border border-slate-900 rounded-lg overflow-hidden select-none max-h-[600px] overflow-y-auto scrollbar-thin">
      <Table className="relative">
        <TableHeader className="bg-slate-950 sticky top-0 z-10 shadow-sm border-b border-slate-900">
          <TableRow className="border-b border-slate-900 bg-slate-950 hover:bg-slate-950">
            {visibleColumns.id && (
              <TableHead
                onClick={() => onSort("id")}
                className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200"
              >
                <span className="flex items-center gap-1">
                  Transaction ID <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
            )}
            {visibleColumns.reference && (
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Reference
              </TableHead>
            )}
            {visibleColumns.sender && (
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Sender
              </TableHead>
            )}
            {visibleColumns.receiver && (
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Receiver
              </TableHead>
            )}
            {visibleColumns.amount && (
              <TableHead
                onClick={() => onSort("amount")}
                className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200"
              >
                <span className="flex items-center gap-1">
                  Amount <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
            )}
            {visibleColumns.status && (
              <TableHead
                onClick={() => onSort("status")}
                className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200"
              >
                <span className="flex items-center gap-1">
                  Status <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
            )}
            {visibleColumns.risk && (
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Risk
              </TableHead>
            )}
            {visibleColumns.createdAt && (
              <TableHead
                onClick={() => onSort("createdAt")}
                className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200 text-right"
              >
                <span className="flex items-center gap-1 justify-end">
                  Created At <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
            )}
            <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-10 text-xs text-slate-500 font-mono bg-slate-950/20"
              >
                No transaction records matching filters.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors bg-slate-950/10"
              >
                {visibleColumns.id && (
                  <TableCell className="font-mono text-slate-350 py-3 text-[11px] max-w-[120px] truncate">
                    {tx.id}
                  </TableCell>
                )}
                {visibleColumns.reference && (
                  <TableCell className="font-mono text-xs text-slate-200 py-3 max-w-[140px] truncate">
                    {tx.reference || (
                      <span className="text-slate-600 font-sans italic">
                        No ref
                      </span>
                    )}
                  </TableCell>
                )}
                {visibleColumns.sender && (
                  <TableCell className="font-mono text-xs text-slate-400 py-3 max-w-[110px] truncate">
                    {tx.sender || (
                      <span className="text-[10px] text-slate-600 font-semibold uppercase">
                        External
                      </span>
                    )}
                  </TableCell>
                )}
                {visibleColumns.receiver && (
                  <TableCell className="font-mono text-xs text-slate-400 py-3 max-w-[110px] truncate">
                    {tx.receiver || (
                      <span className="text-[10px] text-slate-600 font-semibold uppercase">
                        External
                      </span>
                    )}
                  </TableCell>
                )}
                {visibleColumns.amount && (
                  <TableCell className="font-mono text-xs text-white py-3 font-bold">
                    ${(tx.amount || 0).toLocaleString()}
                  </TableCell>
                )}
                {visibleColumns.status && (
                  <TableCell className="py-3">
                    {getStatusBadge(tx.status)}
                  </TableCell>
                )}
                {visibleColumns.risk && (
                  <TableCell className="py-3">
                    <span
                      className={`font-mono text-xs font-semibold ${
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
                )}
                {visibleColumns.createdAt && (
                  <TableCell className="font-mono text-[10px] text-slate-500 py-3 text-right">
                    {new Date(tx.createdAt).toLocaleString()}
                  </TableCell>
                )}
                <TableCell className="py-3 text-right">
                  <Button
                    onClick={() => onSelectTransaction(tx)}
                    variant="outline"
                    className="h-7 px-2 text-[10px] bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white gap-1 cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                    Inspect
                    <ArrowRight className="h-3 w-3 text-slate-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
