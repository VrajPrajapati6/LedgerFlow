"use client";

import * as React from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { SearchPalette } from "./SearchPalette";
import { NotificationMenu } from "./NotificationMenu";
import { UserMenu } from "./UserMenu";
import { Menu } from "lucide-react";

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm select-none">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumbs */}
        <div className="hidden sm:flex">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Environment Badge */}
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 font-mono tracking-wide">
          DEV ENV
        </span>

        {/* Global Command Search */}
        <SearchPalette />

        {/* Notification Bell */}
        <NotificationMenu />

        {/* Divider */}
        <div className="hidden md:block h-5 w-px bg-slate-200" />

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
