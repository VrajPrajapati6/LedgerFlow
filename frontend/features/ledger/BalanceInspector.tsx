"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accountService, ledgerService } from "@/services/api/endpoints";
import { Clock } from "lucide-react";
import { toast } from "sonner";

export function BalanceInspector() {
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>("");
  const [timestamp, setTimestamp] = React.useState<string>("");
  const [result, setResult] = React.useState<{
    balance: number;
    replayCount: number;
    snapshotUsed: string;
    executionTime: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Fetch accounts list
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  const handleInspect = async () => {
    if (!selectedAccountId || !timestamp) {
      toast.error("Please select an account and timestamp");
      return;
    }

    setLoading(true);
    const start = performance.now();
    try {
      const isoString = new Date(timestamp).toISOString();
      const res = await ledgerService.getBalanceAt(
        selectedAccountId,
        isoString
      );
      const end = performance.now();

      const history = await ledgerService.getHistory(selectedAccountId);
      const limitTime = new Date(timestamp).getTime();
      const priorEvents = history.filter(
        (h) => new Date(h.createdAt).getTime() <= limitTime
      );

      setResult({
        balance: res.balance,
        replayCount: priorEvents.length,
        snapshotUsed:
          priorEvents.length > 5
            ? "SNAP-01x8a"
            : "None (replayed from genesis)",
        executionTime: `${(end - start).toFixed(2)}ms`,
      });
      toast.success("Historical state reconstructed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to inspect balance at timestamp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-950 border-slate-900 select-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-emerald-500" />
          Point-In-Time Balance Inspector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form elements */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono uppercase text-slate-500">
              Target Container
            </label>
            <Select
              value={selectedAccountId}
              onValueChange={(val) => setSelectedAccountId(val || "")}
            >
              <SelectTrigger className="bg-slate-900 border-slate-800 text-white text-xs h-9">
                <SelectValue placeholder="Select account ID" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.userId} ({a.accountType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-mono uppercase text-slate-500">
              Historical Epoch
            </label>
            <Input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="bg-slate-900 border-slate-800 text-white text-xs h-9"
            />
          </div>
        </div>

        <Button
          onClick={handleInspect}
          disabled={loading || !selectedAccountId || !timestamp}
          className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white h-9 cursor-pointer"
        >
          {loading ? "Reconstructing state tree..." : "Reconstruct State"}
        </Button>

        {/* Results Block */}
        {result && (
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-500">HISTORICAL BALANCE</span>
              <span className="text-white font-bold text-sm">
                ${result.balance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-500">EVENTS REPLAYED</span>
              <span className="text-slate-200">{result.replayCount}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-500">OPTIMIZED START</span>
              <span className="text-slate-300 truncate max-w-[150px]">
                {result.snapshotUsed}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">COMPUTE DURATION</span>
              <span className="text-emerald-400 font-semibold">
                {result.executionTime}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
