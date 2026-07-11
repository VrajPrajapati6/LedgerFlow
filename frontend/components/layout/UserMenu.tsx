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
import { LogOut, Settings, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 p-1 text-slate-400 hover:text-slate-200 rounded-full focus:outline-none transition-colors cursor-pointer">
        <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold font-sans">
          OP
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-slate-950 border border-slate-800 text-slate-200"
      >
        <DropdownMenuLabel className="font-normal px-4 py-2 block">
          <span className="text-xs font-semibold text-slate-200 block">
            Ops Engineer
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            ops@ledgerflow.internal
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-slate-900 focus:bg-slate-900 rounded-none transition-colors"
        >
          <Settings className="h-4 w-4 text-slate-400" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/system-health")}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-slate-900 focus:bg-slate-900 rounded-none transition-colors"
        >
          <Shield className="h-4 w-4 text-slate-400" />
          <span>System Console</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-rose-950/20 text-rose-400 focus:bg-rose-950/20 rounded-none transition-colors">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
