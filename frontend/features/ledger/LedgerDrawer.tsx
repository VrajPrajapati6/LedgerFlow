"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { transactionService } from "@/services/api/endpoints";
import { Copy, BookOpen } from "lucide-react";
import { LedgerEntry, Transaction } from "@/types";

interface LedgerDrawerProps {
  entry: LedgerEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInspectTransaction: (tx: Transaction) => void;
  allEntries: LedgerEntry[];
}

export function LedgerDrawer({
  entry,
  open,
  onOpenChange,
  onInspectTransaction,
  allEntries = [],
}: LedgerDrawerProps) {
  const [copied, setCopied] = React.useState(false);

  // Fetch parent transaction details
  const { data: parentTx = null } = useQuery({
    queryKey: ["transaction", entry?.transactionId],
    queryFn: () => transactionService.get(entry?.transactionId || ""),
    enabled: !!entry,
  });

  // Calculate previous and next event links (sourcing flow!)
  const { prevEntry, nextEntry, eventPosition } = React.useMemo(() => {
    if (!entry) return { prevEntry: null, nextEntry: null, eventPosition: 0 };

    // Filter events matching the same account to trace timeline sourcing
    const accountEntries = allEntries
      .filter((e) => e.accountId === entry.accountId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    const idx = accountEntries.findIndex((e) => e.id === entry.id);
    return {
      prevEntry: idx > 0 ? accountEntries[idx - 1] : null,
      nextEntry: idx < accountEntries.length - 1 ? accountEntries[idx + 1] : null,
      eventPosition: idx + 1,
    };
  }, [allEntries, entry]);

  const copyId = () => {
    if (!entry) return;
    navigator.clipboard.writeText(entry.id);
    setCopied(true);
    toast.success("Event ID copied to clipboard");
    setTimeout(() => setCopied(false), 200);
  };

  if (!entry) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-950 border-slate-900 text-slate-200 w-full sm:max-w-md overflow-y-auto scrollbar-thin select-none">
        <SheetHeader className="pb-4 border-b border-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Immutable Ledger Entry
            </span>
            <Badge
              className={
                entry.entryType === "CREDIT"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]"
                  : "bg-rose-500/10 text-rose-450 border-rose-500/20 text-[9px]"
              }
            >
              {entry.entryType}
            </Badge>
          </div>
          <SheetTitle className="text-white text-base font-mono flex items-center gap-1.5 mt-2">
            Event ID: {entry.id.slice(0, 16)}...
            <Button
              variant="outline"
              onClick={copyId}
              className="h-6 w-6 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </SheetTitle>
          <SheetDescription className="text-slate-400 text-xs font-mono">
            Committed at: {new Date(entry.createdAt).toLocaleString()}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-5">
          {/* Sourcing Timeline Position */}
          <div className="bg-blue-600/5 border border-blue-500/15 p-3 rounded-lg flex items-center justify-between text-xs font-mono">
            <span className="text-blue-400">Ledger Position index:</span>
            <span className="text-white font-bold">#{eventPosition}</span>
          </div>

          {/* Details Block */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Event Details
            </h4>
            <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-lg space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">ACCOUNT ID:</span>
                <span className="text-slate-200">{entry.accountId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">EVENT TYPE:</span>
                <span className="text-slate-200">{entry.entryType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AMOUNT IMPACT:</span>
                <span className="text-white font-bold">
                  ${Number(entry.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DESCRIPTION:</span>
                <span className="text-slate-300">
                  {entry.description || "System transaction"}
                </span>
              </div>
            </div>
          </div>

          {/* Sourcing Context navigation */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Event Sourcing Chains
            </h4>
            <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-lg space-y-3 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-500 block mb-0.5">
                  PREVIOUS EVENT
                </span>
                {prevEntry ? (
                  <span className="text-slate-300 block text-[10px] select-all">
                    {prevEntry.id}
                  </span>
                ) : (
                  <span className="text-slate-600 italic">
                    Genesis Account Event
                  </span>
                )}
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block mb-0.5">
                  NEXT EVENT
                </span>
                {nextEntry ? (
                  <span className="text-slate-300 block text-[10px] select-all">
                    {nextEntry.id}
                  </span>
                ) : (
                  <span className="text-slate-600 italic">
                    Latest State Leaf
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Parent Transaction link */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Parent Transaction Context
            </h4>
            <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-lg space-y-3 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-500 block">
                  TRANSACTION ID
                </span>
                <span className="text-slate-300 block select-all">
                  {entry.transactionId}
                </span>
              </div>
              {parentTx && (
                <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-500 block">
                      AMOUNT / REF
                    </span>
                    <span className="text-slate-300">
                      ${(parentTx.amount || 0).toLocaleString()} •{" "}
                      {parentTx.reference || "DEP"}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      onInspectTransaction(parentTx);
                      onOpenChange(false);
                    }}
                    variant="outline"
                    className="h-7 px-2 text-[10px] bg-slate-950 border-slate-800 text-blue-400 hover:text-white cursor-pointer"
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Inspect Tx
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
