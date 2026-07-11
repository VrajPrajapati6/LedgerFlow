"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  accounts: "Accounts",
  transactions: "Transactions",
  ledger: "Ledger Explorer",
  fraud: "Fraud Center",
  reconciliation: "Reconciliation",
  audit: "Audit Trail",
  snapshots: "Snapshots",
  "system-health": "System Health",
  settings: "Settings",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  const paths = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Home"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {paths.map((p, idx) => {
          const routePath = "/" + paths.slice(0, idx + 1).join("/");
          const isLast = idx === paths.length - 1;
          const label =
            routeLabels[p] ||
            decodeURIComponent(p)
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <React.Fragment key={routePath}>
              <li>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              </li>
              <li>
                {isLast ? (
                  <span className="font-medium text-slate-900 truncate max-w-[160px]">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={routePath}
                    className="text-slate-500 hover:text-slate-900 transition-colors truncate max-w-[120px]"
                  >
                    {label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
