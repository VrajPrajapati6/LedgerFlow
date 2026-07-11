"use client";

import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 select-none">
      <div className="flex flex-col items-center space-y-6 max-w-md text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-blue-500">
          <Landmark className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight font-mono">404</h1>
          <h2 className="text-lg font-semibold text-slate-200">
            Terminal Address Not Found
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            The resource endpoint or route does not exist. Check route casing or
            verify authentication.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
