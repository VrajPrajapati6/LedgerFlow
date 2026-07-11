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
  Search,
} from "lucide-react";

const pages = [
  {
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, desc: "System overview & KPIs" },
    ],
  },
  {
    group: "Operations",
    items: [
      { name: "Accounts", href: "/accounts", icon: Landmark, desc: "Account registry & management" },
      { name: "Transactions", href: "/transactions", icon: ArrowLeftRight, desc: "Transfer logs & history" },
      { name: "Ledger Explorer", href: "/ledger", icon: ScrollText, desc: "Double-entry event journal" },
    ],
  },
  {
    group: "Risk & Compliance",
    items: [
      { name: "Fraud Center", href: "/fraud", icon: ShieldAlert, desc: "Risk alerts & investigations" },
      { name: "Reconciliation", href: "/reconciliation", icon: GitCompare, desc: "Settlement audit matching" },
      { name: "Audit Trail", href: "/audit", icon: History, desc: "Point-in-time state replay" },
    ],
  },
  {
    group: "Infrastructure",
    items: [
      { name: "Snapshots", href: "/snapshots", icon: FileClock, desc: "Balance checkpoints" },
      { name: "System Health", href: "/system-health", icon: Activity, desc: "SRE observability metrics" },
      { name: "Settings", href: "/settings", icon: Settings, desc: "Platform configuration" },
    ],
  },
];

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
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center justify-between gap-2 h-8 px-3 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors w-52"
      >
        <span className="flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          Search LedgerFlow...
        </span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] text-slate-400 shadow-sm">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* Mobile search icon */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open search"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, actions, accounts..." />
        <CommandList>
          <CommandEmpty className="py-8 text-center text-sm text-slate-500">
            No results found.
          </CommandEmpty>

          {pages.map((group, idx) => (
            <React.Fragment key={group.group}>
              {idx > 0 && <CommandSeparator />}
              <CommandGroup heading={group.group}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.name}
                      value={item.name}
                      onSelect={() => navigate(item.href)}
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                        <Icon className="h-3.5 w-3.5 text-slate-600" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-slate-900">{item.name}</span>
                        <span className="text-xs text-slate-500 truncate">{item.desc}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
