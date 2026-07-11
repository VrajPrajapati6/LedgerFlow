"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();

  if (!pathname || pathname === "/" || pathname === "/dashboard") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
        <span>ledgerflow</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
        <span className="text-slate-300">dashboard</span>
      </div>
    );
  }

  const paths = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
      <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
        ledgerflow
      </Link>
      {paths.map((p, idx) => {
        const routePath = "/" + paths.slice(0, idx + 1).join("/");
        const isLast = idx === paths.length - 1;
        const formattedName = decodeURIComponent(p).replace(/-/g, " ");

        return (
          <React.Fragment key={routePath}>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            {isLast ? (
              <span className="text-slate-300 font-medium truncate max-w-[120px]">
                {formattedName}
              </span>
            ) : (
              <Link
                href={routePath}
                className="hover:text-slate-300 transition-colors truncate max-w-[120px]"
              >
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
