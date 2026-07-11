import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 mb-6">
        <AlertTriangle className="h-7 w-7 text-amber-500" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">404</h1>
      <h2 className="text-lg font-semibold text-slate-700 mb-3">Page not found</h2>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-8">
        The page you are looking for does not exist in LedgerFlow. It may have been moved or the URL is incorrect.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/accounts">
          <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100 gap-2">
            Accounts
          </Button>
        </Link>
      </div>
    </div>
  );
}
