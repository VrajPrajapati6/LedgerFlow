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
import { LedgerEntry } from "@/types";
import { ArrowUpDown, Eye, ArrowRight } from "lucide-react";

interface LedgerTableProps {
  entries: LedgerEntry[];
  onSort: (field: "createdAt" | "amount" | "id") => void;
  sortField: string;
  sortOrder: "asc" | "desc";
  onSelectEvent: (entry: LedgerEntry) => void;
}

export function LedgerTable({
  entries = [],
  onSort,
  sortField,
  sortOrder,
  onSelectEvent,
}: LedgerTableProps) {
  return (
    <div className="border border-slate-900 rounded-lg overflow-hidden select-none max-h-[600px] overflow-y-auto scrollbar-thin">
      <Table className="relative">
        <TableHeader className="bg-slate-950 sticky top-0 z-10 shadow-sm border-b border-slate-900">
          <TableRow className="border-b border-slate-900 bg-slate-950 hover:bg-slate-950">
            <TableHead
              onClick={() => onSort("id")}
              className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200"
            >
              <span className="flex items-center gap-1">
                Event ID <ArrowUpDown className="h-3 w-3" />
              </span>
            </TableHead>
            <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
              Tx ID
            </TableHead>
            <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
              Account
            </TableHead>
            <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
              Type
            </TableHead>
            <TableHead
              onClick={() => onSort("amount")}
              className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200"
            >
              <span className="flex items-center gap-1">
                Amount <ArrowUpDown className="h-3 w-3" />
              </span>
            </TableHead>
            <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
              Impact
            </TableHead>
            <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
              Description
            </TableHead>
            <TableHead
              onClick={() => onSort("createdAt")}
              className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200 text-right"
            >
              <span className="flex items-center gap-1 justify-end">
                Timestamp <ArrowUpDown className="h-3 w-3" />
              </span>
            </TableHead>
            <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-10 text-xs text-slate-500 font-mono bg-slate-950/20"
              >
                No ledger events matching filters.
              </TableCell>
            </TableRow>
          ) : (
            entries.map((e) => (
              <TableRow
                key={e.id}
                className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors bg-slate-950/10"
              >
                <TableCell className="font-mono text-slate-350 py-3 text-[11px] max-w-[120px] truncate">
                  {e.id}
                </TableCell>
                <TableCell className="font-mono text-[10px] text-slate-500 py-3 max-w-[110px] truncate">
                  {e.transactionId}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-400 py-3 max-w-[120px] truncate">
                  {e.accountId}
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    variant="outline"
                    className={
                      e.entryType === "CREDIT"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-mono"
                        : "bg-rose-500/10 text-rose-450 border-rose-500/20 text-[9px] font-mono"
                    }
                  >
                    {e.entryType}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-white py-3 font-semibold">
                  ${Number(e.amount).toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-xs py-3 font-bold">
                  {e.entryType === "CREDIT" ? (
                    <span className="text-emerald-400">
                      +${Number(e.amount).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-rose-500">
                      -${Number(e.amount).toLocaleString()}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-slate-300 font-mono max-w-[150px] truncate py-3">
                  {e.description || (
                    <span className="text-slate-600 font-sans italic">
                      No desc
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-[10px] text-slate-500 py-3 text-right">
                  {new Date(e.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="py-3 text-right">
                  <Button
                    onClick={() => onSelectEvent(e)}
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
