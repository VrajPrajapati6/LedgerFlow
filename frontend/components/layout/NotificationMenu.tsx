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
import { Bell, Info, ShieldAlert, CheckCircle2 } from "lucide-react";

export function NotificationMenu() {
  const [unreadCount, setUnreadCount] = React.useState(3);

  const notifications = [
    {
      id: 1,
      type: "alert",
      message: "Velocity limit exceeded on Account A301",
      time: "2 mins ago",
      icon: ShieldAlert,
      iconColor: "text-rose-500",
    },
    {
      id: 2,
      type: "reconciliation",
      message: "Missing external settlement record on TX-3091",
      time: "15 mins ago",
      icon: Info,
      iconColor: "text-amber-500",
    },
    {
      id: 3,
      type: "system",
      message: "Daily snapshot run completed successfully",
      time: "1 hour ago",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-md transition-colors cursor-pointer">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-slate-950 border border-slate-800 text-slate-200"
      >
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="text-xs font-semibold text-slate-400">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={() => setUnreadCount(0)}
              className="text-[10px] text-blue-500 hover:text-blue-400 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-slate-800" />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <DropdownMenuItem
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-900 focus:bg-slate-900 rounded-none transition-colors border-b border-slate-900/50 last:border-0"
              >
                <Icon className={`h-4 w-4 mt-0.5 ${n.iconColor} shrink-0`} />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-200 leading-tight">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    {n.time}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
