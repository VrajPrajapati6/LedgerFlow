"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Account } from "@/types";
import { Landmark, Eye, ShieldCheck, ShieldAlert } from "lucide-react";

interface AccountsGridProps {
  accounts: (Account & { transactionsCount?: number })[];
}

export function AccountsGrid({ accounts = [] }: AccountsGridProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-450 border-emerald-500/20 text-[9px]">
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

  const getRiskBadge = (a: Account) => {
    if (a.status === "BLOCKED") {
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/5 text-rose-400 border-rose-500/20 text-[9px] font-mono flex items-center gap-1"
        >
          <ShieldAlert className="h-3 w-3 shrink-0" />
          HIGH RISK
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-slate-900 text-slate-450 border-slate-800 text-[9px] font-mono flex items-center gap-1"
      >
        <ShieldCheck className="h-3 w-3 text-slate-500 shrink-0" />
        LOW RISK
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 select-none">
      {accounts.map((a) => (
        <Card
          key={a.id}
          className="bg-slate-950 border-slate-900 hover:border-slate-800 transition-colors"
        >
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-slate-900 border border-slate-800">
                  <Landmark className="h-4 w-4 text-blue-500 shrink-0" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    USER CONTAINER
                  </span>
                  <span className="text-xs font-bold text-white font-mono">
                    {a.userId}
                  </span>
                </div>
              </div>
              {getStatusBadge(a.status)}
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                Container Balance
              </span>
              <div className="text-xl font-bold text-white font-mono">
                ${(a.balance || 0).toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-400 font-sans">
                  {a.currency}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-3">
              <div className="space-y-1">
                <span>Segment Type</span>
                <span className="block text-slate-300 font-bold uppercase text-[9px]">
                  {a.accountType}
                </span>
              </div>
              <div className="space-y-1 text-right">
                <span>Ledger Events</span>
                <span className="block text-slate-350 font-bold">
                  {a.transactionsCount || 0}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-900 pt-3">
              {getRiskBadge(a)}
              <Link href={`/accounts/${a.id}`}>
                <Button
                  variant="outline"
                  className="h-7 px-2 text-[10px] bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white gap-1 cursor-pointer"
                >
                  <Eye className="h-3 w-3" />
                  Inspect Container
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
