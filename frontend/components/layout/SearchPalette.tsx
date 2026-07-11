"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  ScrollText,
  ShieldAlert,
  GitCompare,
  FileClock,
  Activity,
  Settings,
  History,
} from "lucide-react";

export function SearchPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center justify-between w-60 px-3 py-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800/80 hover:text-slate-200 transition-colors"
      >
        <span className="flex items-center gap-2">Search console...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search page..." />
        <CommandList className="bg-slate-950 text-slate-200 border-t border-slate-800">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="General">
            <CommandItem
              onSelect={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator className="bg-slate-800" />
          <CommandGroup heading="Operations">
            <CommandItem
              onSelect={() => navigate("/accounts")}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded"
            >
              <Landmark className="h-4 w-4" />
              <span>Accounts Directory</span>
            </CommandItem>
            <CommandItem
              onSelect={() => navigate("/transactions")}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span>Transactions Ledger</span>
            </CommandItem>
            <CommandItem
              onSelect={() => navigate("/ledger")}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded"
            >
              <ScrollText className="h-4 w-4" />
              <span>Ledger Explorer</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator className="bg-slate-800" />
          <CommandGroup heading="Risk & Compliance">
            <CommandItem
              onSelect={() => navigate("/fraud")}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Fraud Center</span>
            </CommandItem>
            <CommandItem
              onSelect={() => navigate("/reconciliation")}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded"
            >
              <GitCompare className="h-4 w-4" />
              <span>Reconciliation Hub</span>
            </CommandItem>
            <CommandItem
              onSelect={() => navigate("/audit")}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded"
            >
              <History className="h-4 w-4" />
              <span>Audit Explorer</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator className="bg-slate-800" />
          <CommandGroup heading="Infrastructure">
            <CommandItem
              onSelect={() => navigate("/snapshots")}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded"
            >
              <FileClock className="h-4 w-4" />
              <span>Snapshot Manager</span>
            </CommandItem>
            <CommandItem
              onSelect={() => navigate("/system-health")}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded"
            >
              <Activity className="h-4 w-4" />
              <span>System Health Monitor</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator className="bg-slate-800" />
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => navigate("/settings")}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
