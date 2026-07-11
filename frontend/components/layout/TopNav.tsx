"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "./Breadcrumbs";
import { SearchPalette } from "./SearchPalette";
import { NotificationMenu } from "./NotificationMenu";
import { ThemeSwitch } from "./ThemeSwitch";
import { UserMenu } from "./UserMenu";
import { Menu } from "lucide-react";

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-900 bg-slate-950/80 px-4 backdrop-blur select-none">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 md:hidden transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Title & Breadcrumbs */}
        <div className="hidden sm:flex flex-col">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/25 font-mono">
          Development
        </span>

        {/* Global Command Search */}
        <SearchPalette />

        {/* Notification Bell Menu */}
        <NotificationMenu />

        {/* Theme Switching Switch */}
        <ThemeSwitch />

        {/* User Account Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
