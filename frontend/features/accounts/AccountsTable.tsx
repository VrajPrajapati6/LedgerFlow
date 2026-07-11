"use client";

import * as React from "react";
import Link from "next/link";
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
import { Account } from "@/types";
import { ArrowUpDown, Eye, ArrowRight } from "lucide-react";

interface AccountsTableProps {
  accounts: Account[];
  visibleColumns: Record<string, boolean>;
  onSort: (
    field: "id" | "balance" | "accountType" | "status" | "createdAt"
  ) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
}

export function AccountsTable({
  accounts = [],
  visibleColumns,
  onSort,
  sortField,
  sortOrder,
}: AccountsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
            ACTIVE
          </Badge>
        );
      case "BLOCKED":
        return (
          <Badge className="bg-rose-500/10 text-rose-450 border-rose-500/20 text-[9px]">
            BLOCKED
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/10 text-slate-450 border-slate-500/20 text-[9px]">
            {status}
          </Badge>
        );
    }
  };

  const getRiskStatus = (a: Account) => {
    if (a.status === "BLOCKED")
      return <span className="text-rose-500 font-semibold font-mono">HIGH</span>;
    if (a.accountType === "OPERATING")
      return <span className="text-blue-400 font-semibold font-mono">SYSTEM</span>;
    return <span className="text-slate-500 font-semibold font-mono">LOW</span>;
  };

  return (
    <div className="border border-slate-900 rounded-lg overflow-hidden select-none">
      <Table>
        <TableHeader className="bg-slate-900/50">
          <TableRow className="border-b border-slate-900">
            {visibleColumns.id && (
              <TableHead
                onClick={() => onSort("id")}
                className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200"
              >
                <span className="flex items-center gap-1">
                  Account ID <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
            )}
            {visibleColumns.userId && (
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                User ID
              </TableHead>
            )}
            {visibleColumns.accountType && (
              <TableHead
                onClick={() => onSort("accountType")}
                className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200"
              >
                <span className="flex items-center gap-1">
                  Type <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
            )}
            {visibleColumns.currency && (
              <TableHead className="text-[10px] font-mono uppercase text-slate-400 py-3">
                Currency
              </TableHead>
            )}
            {visibleColumns.balance && (
              <TableHead
                onClick={() => onSort("balance")}
                className="text-[10px] font-mono uppercase text-slate-400 py-3 cursor-pointer hover:text-slate-200"
              >
                <span className="flex items-center gap-1">
                  Balance <ArrowUpDown className="h-3 w-3" />
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
                Risk Status
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
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-8 text-xs text-slate-500 font-mono"
              >
                No ledger containers provisioned.
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((a) => (
              <TableRow
                key={a.id}
                className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors"
              >
                {visibleColumns.id && (
                  <TableCell className="font-mono text-slate-200 py-3 text-xs">
                    {a.id}
                  </TableCell>
                )}
                {visibleColumns.userId && (
                  <TableCell className="font-mono text-xs text-slate-300 py-3 font-semibold">
                    {a.userId}
                  </TableCell>
                )}
                {visibleColumns.accountType && (
                  <TableCell className="font-mono text-[10px] text-slate-400 py-3 font-semibold uppercase">
                    {a.accountType}
                  </TableCell>
                )}
                {visibleColumns.currency && (
                  <TableCell className="font-mono text-xs text-slate-450 py-3">
                    {a.currency}
                  </TableCell>
                )}
                {visibleColumns.balance && (
                  <TableCell className="font-mono text-xs text-white py-3 font-bold">
                    ${(a.balance || 0).toLocaleString()}
                  </TableCell>
                )}
                {visibleColumns.status && (
                  <TableCell className="py-3">
                    {getStatusBadge(a.status)}
                  </TableCell>
                )}
                {visibleColumns.risk && (
                  <TableCell className="text-xs py-3">{getRiskStatus(a)}</TableCell>
                )}
                {visibleColumns.createdAt && (
                  <TableCell className="font-mono text-[10px] text-slate-500 py-3 text-right">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </TableCell>
                )}
                <TableCell className="py-3 text-right">
                  <Link href={`/accounts/${a.id}`}>
                    <Button
                      variant="outline"
                      className="h-7 px-2 text-[10px] bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white gap-1 cursor-pointer"
                    >
                      <Eye className="h-3 w-3" />
                      Inspect
                      <ArrowRight className="h-3 w-3 text-slate-500" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
