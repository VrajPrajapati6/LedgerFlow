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
import { Bell, ShieldAlert, Info, CheckCircle2, GitCompare } from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "fraud",
    title: "Fraud Alert",
    message: "Velocity limit exceeded on Account A301",
    time: "2 min ago",
    icon: ShieldAlert,
    dot: "bg-red-500",
    bg: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    id: 2,
    type: "reconciliation",
    title: "Reconciliation",
    message: "Missing settlement record on TX-3091",
    time: "15 min ago",
    icon: GitCompare,
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: 3,
    type: "system",
    title: "Snapshot Complete",
    message: "Daily balance checkpoints saved successfully",
    time: "1 hr ago",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export function NotificationMenu() {
  const [unreadCount, setUnreadCount] = React.useState(2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 bg-white border border-slate-200 shadow-lg p-0"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <DropdownMenuLabel className="p-0 text-sm font-semibold text-slate-900">
              Notifications
            </DropdownMenuLabel>
            <p className="text-xs text-slate-500 mt-0.5">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => setUnreadCount(0)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <DropdownMenuItem
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 rounded-none transition-colors"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${n.bg} shrink-0`}
                >
                  <Icon className={`h-3.5 w-3.5 ${n.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
                  <span className="text-[10px] text-slate-400">{n.time}</span>
                </div>
                <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${n.dot}`} />
              </DropdownMenuItem>
            );
          })}
        </div>

        <div className="px-4 py-2.5 border-t border-slate-100">
          <button className="w-full text-xs text-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View all notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
