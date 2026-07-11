"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  ScrollText,
  ShieldAlert,
  GitCompare,
  History,
  FileClock,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
  className?: string;
  onItemClick?: () => void;
}

const navigation = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Accounts", href: "/accounts", icon: Landmark },
      { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
      { name: "Ledger Explorer", href: "/ledger", icon: ScrollText },
    ],
  },
  {
    title: "Risk & Compliance",
    items: [
      {
        name: "Fraud Center",
        href: "/fraud",
        icon: ShieldAlert,
        badgeColor: "red",
      },
      { name: "Reconciliation", href: "/reconciliation", icon: GitCompare },
      { name: "Audit Trail", href: "/audit", icon: History },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { name: "Snapshots", href: "/snapshots", icon: FileClock },
      { name: "System Health", href: "/system-health", icon: Activity },
    ],
  },
  {
    title: "General",
    items: [{ name: "Settings", href: "/settings", icon: Settings }],
  },
];

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  className,
  onItemClick,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-200 select-none",
        isCollapsed ? "w-[60px]" : "w-60",
        className
      )}
    >
      {/* Logo / Brand Header */}
      <div
        className={cn(
          "flex items-center h-14 border-b border-slate-200 shrink-0",
          isCollapsed ? "px-0 justify-center" : "px-4 gap-3"
        )}
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-blue-600 shrink-0">
          <span className="text-white text-xs font-bold">LF</span>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <Link
              href="/dashboard"
              onClick={onItemClick}
              className="text-sm font-semibold text-slate-900 tracking-tight leading-none hover:text-blue-600 transition-colors"
            >
              LedgerFlow
            </Link>
            <span className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
              Financial Infrastructure
            </span>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {navigation.map((group, idx) => (
          <div key={idx} className="space-y-0.5">
            {!isCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onItemClick}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md text-sm font-medium transition-all duration-150",
                    isCollapsed
                      ? "justify-center h-9 w-9 mx-auto"
                      : "px-3 py-2 w-full",
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "shrink-0",
                      isCollapsed ? "h-4.5 w-4.5" : "h-4 w-4",
                      isActive ? "text-blue-600" : "text-slate-400"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {!isCollapsed && isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — Collapse Toggle + Version */}
      <div className="border-t border-slate-200 p-3 flex items-center justify-between shrink-0">
        {!isCollapsed && (
          <span className="text-[10px] text-slate-400 font-mono">
            v1.0 · Production
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </aside>
  );
}
