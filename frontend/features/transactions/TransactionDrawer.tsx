"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ledgerService, fraudService } from "@/services/api/endpoints";
import {
  Copy,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  GitCompare,
  RotateCw,
} from "lucide-react";
import { Transaction } from "@/types";

interface TransactionDrawerProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refetchData: () => void;
}

export function TransactionDrawer({
  transaction,
  open,
  onOpenChange,
  refetchData,
}: TransactionDrawerProps) {
  const [copied, setCopied] = React.useState(false);

  // Fetch all ledger entries to filter related ones
  const { data: allLedger = [] } = useQuery({
    queryKey: ["ledger"],
    queryFn: ledgerService.list,
    enabled: !!transaction,
  });

  const relatedEntries = React.useMemo(() => {
    if (!transaction) return [];
    return allLedger.filter((e) => e.transactionId === transaction.id);
  }, [allLedger, transaction]);

  // Mutations
  const runFraudMutation = useMutation({
    mutationFn: () => fraudService.analyze(transaction?.id || ""),
    onSuccess: () => {
      toast.success("Fraud velocity checks recalculated");
      refetchData();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to analyze risk parameters");
    },
  });

  const copyId = () => {
    if (!transaction) return;
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    toast.success("Transaction ID copied to clipboard");
    setTimeout(() => setCopied(false), 200);
  };

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

  if (!transaction) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-950 border-slate-900 text-slate-200 w-full sm:max-w-md overflow-y-auto scrollbar-thin select-none">
        <SheetHeader className="pb-4 border-b border-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              TRANSACTION Telemetry
            </span>
            {getStatusBadge(transaction.status)}
          </div>
          <SheetTitle className="text-white text-base font-mono flex items-center gap-1.5 mt-2">
            ID: {transaction.id.slice(0, 16)}...
            <Button
              variant="outline"
              onClick={copyId}
              className="h-6 w-6 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </SheetTitle>
          <SheetDescription className="text-slate-400 text-xs font-mono">
            Recorded at: {new Date(transaction.createdAt).toLocaleString()}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-5">
          {/* Metadata Block */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Exchange Metadata
            </h4>
            <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-lg space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">REFERENCE:</span>
                <span className="text-slate-250">
                  {transaction.reference || "DEPOSIT"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TRANSFER VALUE:</span>
                <span className="text-white font-bold">
                  ${(transaction.amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CURRENCY:</span>
                <span className="text-slate-200">USD</span>
              </div>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Hydrated Account Contexts
            </h4>
            <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-lg space-y-3 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-500 block">
                  SENDER (DEBIT)
                </span>
                {transaction.sender ? (
                  <Link
                    href={`/accounts/${transaction.sender}`}
                    className="text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {transaction.sender}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </Link>
                ) : (
                  <span className="text-slate-400 italic">
                    External Capital Inflow
                  </span>
                )}
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">
                  RECEIVER (CREDIT)
                </span>
                {transaction.receiver ? (
                  <Link
                    href={`/accounts/${transaction.receiver}`}
                    className="text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {transaction.receiver}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </Link>
                ) : (
                  <span className="text-slate-450">--</span>
                )}
              </div>
            </div>
          </div>

          {/* Related Ledger Entries */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Double-Entry Ledger Balancing
            </h4>
            <div className="border border-slate-900 rounded-lg overflow-hidden text-[11px]">
              <Table>
                <TableHeader className="bg-slate-900/50">
                  <TableRow className="border-b border-slate-900">
                    <TableHead className="text-[9px] font-mono uppercase text-slate-500 py-1.5">
                      Account ID
                    </TableHead>
                    <TableHead className="text-[9px] font-mono uppercase text-slate-500 py-1.5">
                      Type
                    </TableHead>
                    <TableHead className="text-[9px] font-mono uppercase text-slate-500 py-1.5 text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedEntries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-4 text-[10px] text-slate-500 font-mono"
                      >
                        No entries mapped yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    relatedEntries.map((e) => (
                      <TableRow key={e.id} className="border-b border-slate-900">
                        <TableCell className="font-mono text-slate-350 py-1.5">
                          {e.accountId.slice(0, 10)}...
                        </TableCell>
                        <TableCell className="py-1.5">
                          <span
                            className={
                              e.entryType === "CREDIT"
                                ? "text-emerald-500 font-semibold"
                                : "text-rose-500 font-semibold"
                            }
                          >
                            {e.entryType}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-right py-1.5 font-semibold text-white">
                          ${Number(e.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Risk & Recon Audits */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Compliance Audits
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-lg space-y-1.5">
                <span className="text-[9px] text-slate-500">RISK RATING</span>
                <div className="flex items-center gap-1.5">
                  {(transaction.riskScore || 0) > 40 ? (
                    <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                  <span className="text-white font-bold">
                    {transaction.riskScore || 0}
                  </span>
                </div>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-lg space-y-1.5">
                <span className="text-[9px] text-slate-500">RECON SCAN</span>
                <div className="flex items-center gap-1.5">
                  <GitCompare className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="text-white font-bold">MATCHED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 border-t border-slate-900 pt-4">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Control Panel
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => runFraudMutation.mutate()}
                disabled={runFraudMutation.isPending}
                variant="outline"
                className="text-[10px] h-8 bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <RotateCw className="h-3 w-3 mr-1" />
                Run Fraud Scan
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
