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
  Database,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
  className?: string;
  onItemClick?: () => void;
}

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  className,
  onItemClick,
}: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      title: "Dashboard",
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
          badge: "Alerts",
        },
        {
          name: "Reconciliation",
          href: "/reconciliation",
          icon: GitCompare,
          warning: true,
        },
        { name: "Audit Explorer", href: "/audit", icon: History },
      ],
    },
    {
      title: "Infrastructure",
      items: [
        { name: "Snapshot Manager", href: "/snapshots", icon: FileClock },
        { name: "System Health", href: "/system-health", icon: Activity },
      ],
    },
    {
      title: "General",
      items: [{ name: "Settings", href: "/settings", icon: Settings }],
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-slate-950 border-r border-slate-900 text-slate-300 transition-all duration-300 relative select-none",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-slate-900">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-slate-100 font-mono tracking-tight shrink-0"
          onClick={onItemClick}
        >
          <Database className="h-5 w-5 text-blue-500 shrink-0" />
          {!isCollapsed && <span className="text-sm">FINCORE OS</span>}
        </Link>
        {!className && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center h-6 w-6 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {navigation.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            {!isCollapsed && (
              <h2 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                {group.title}
              </h2>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onItemClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-all",
                        isActive
                          ? "bg-blue-500/10 text-blue-450 border-l-2 border-blue-500 pl-2.5"
                          : "hover:bg-slate-900 hover:text-slate-200 border-l-2 border-transparent"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-blue-400" : "text-slate-400"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate flex-1">{item.name}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">
                          {item.badge}
                        </span>
                      )}
                      {!isCollapsed && item.warning && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/50">
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>ENV: DEV</span>
            <span>V1.0.0</span>
          </div>
        ) : (
          <div className="text-[10px] text-center text-slate-600 font-mono">
            DEV
          </div>
        )}
      </div>
    </aside>
  );
}
