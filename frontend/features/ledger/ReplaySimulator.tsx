"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accountService, ledgerService } from "@/services/api/endpoints";
import { Play, Pause, SkipForward, RotateCcw, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

export function ReplaySimulator() {
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>("");
  const [stepIndex, setStepIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [replayedBalance, setReplayedBalance] = React.useState(0);

  // Fetch accounts list
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  // Fetch history for selected account
  const { data: ledgerHistory = [] } = useQuery({
    queryKey: ["ledgerHistory", selectedAccountId],
    queryFn: () => ledgerService.getHistory(selectedAccountId),
    enabled: !!selectedAccountId,
  });

  // Sort history oldest first
  const sortedEntries = React.useMemo(() => {
    return [...ledgerHistory].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [ledgerHistory]);

  // Interval timer for playback
  React.useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (stepIndex < sortedEntries.length) {
          setStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          toast.success("State replay simulation finalized.");
        }
      }, 800);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, stepIndex, sortedEntries]);

  // Calculate balance based on current step index
  React.useEffect(() => {
    let bal = 0;
    for (let i = 0; i < stepIndex; i++) {
      const entry = sortedEntries[i];
      if (entry.entryType === "CREDIT") {
        bal += Number(entry.amount);
      } else {
        bal -= Number(entry.amount);
      }
    }
    setReplayedBalance(bal);
  }, [stepIndex, sortedEntries]);

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const handleStep = () => {
    if (stepIndex < sortedEntries.length) {
      setStepIndex((prev) => prev + 1);
    } else {
      toast.info("All ledger events replayed.");
    }
  };

  const handleReplayAll = () => {
    setIsPlaying(false);
    setStepIndex(sortedEntries.length);
    toast.success("Instant complete replay finished.");
  };

  return (
    <Card className="bg-slate-950 border-slate-900 select-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          Double-Entry Replay Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Selector */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono uppercase text-slate-500">
            Select Simulation Container
          </label>
          <Select
            value={selectedAccountId}
            onValueChange={(val) => {
              setSelectedAccountId(val || "");
              setStepIndex(0);
              setIsPlaying(false);
            }}
          >
            <SelectTrigger className="bg-slate-900 border-slate-800 text-white text-xs h-9">
              <SelectValue placeholder="Select target account ID" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.userId} ({a.accountType} - {a.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Replayed Balance Visual */}
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg text-center space-y-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
            Reconstructed Balance
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            ${replayedBalance.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Step {stepIndex} of {sortedEntries.length} events replayed
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={handleReset}
            disabled={!selectedAccountId || stepIndex === 0}
            variant="outline"
            className="h-8 w-8 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!selectedAccountId || stepIndex === sortedEntries.length}
            className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Play
              </>
            )}
          </Button>

          <Button
            onClick={handleStep}
            disabled={!selectedAccountId || stepIndex === sortedEntries.length}
            variant="outline"
            className="h-8 px-3 text-xs bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white gap-1 cursor-pointer"
          >
            <SkipForward className="h-3.5 w-3.5" /> Step
          </Button>

          <Button
            onClick={handleReplayAll}
            disabled={!selectedAccountId || stepIndex === sortedEntries.length}
            variant="outline"
            className="h-8 px-3 text-xs bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white gap-1 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-indigo-400" /> Fast
          </Button>
        </div>

        {/* Animated event progression step indicator list */}
        {selectedAccountId && sortedEntries.length > 0 && (
          <div className="border-t border-slate-900 pt-3 space-y-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Sourced Event Log stream
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin text-[10px] font-mono">
              {sortedEntries.map((e, index) => {
                const isProcessed = index < stepIndex;
                const isCurrent = index === stepIndex - 1;
                return (
                  <div
                    key={e.id}
                    className={`flex items-center justify-between p-1.5 rounded transition-all duration-300 ${
                      isCurrent
                        ? "bg-indigo-500/10 border border-indigo-500/20 text-white animate-pulse"
                        : isProcessed
                        ? "text-slate-400 opacity-60"
                        : "text-slate-600 opacity-30"
                    }`}
                  >
                    <span className="truncate max-w-[150px]">
                      {e.description || "Inflow"}
                    </span>
                    <span
                      className={
                        e.entryType === "CREDIT"
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }
                    >
                      {e.entryType === "CREDIT" ? "+" : "-"}${Number(e.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
