"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none cursor-pointer group">
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all">
          OE
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-white border border-slate-200 shadow-lg p-0"
      >
        <div className="px-4 py-3 border-b border-slate-100">
          <DropdownMenuLabel className="p-0 text-sm font-semibold text-slate-900">
            Ops Engineer
          </DropdownMenuLabel>
          <span className="text-xs text-slate-500 font-mono">
            ops@ledgerflow.internal
          </span>
        </div>

        <div className="p-1">
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors"
          >
            <Settings className="h-3.5 w-3.5 text-slate-500" />
            Platform Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/system-health")}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors"
          >
            <Activity className="h-3.5 w-3.5 text-slate-500" />
            System Health
          </DropdownMenuItem>
        </div>

        <div className="p-1 border-t border-slate-100">
          <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-50 rounded-md transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
