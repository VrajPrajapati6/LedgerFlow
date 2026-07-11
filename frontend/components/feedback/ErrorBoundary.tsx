"use client";

import * as React from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error in LedgerFlow console:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 border border-red-500/20 bg-red-500/5 rounded-xl text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-sm font-semibold text-red-400">
              Console Runtime Error
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              An error occurred while rendering this module. You can attempt to
              refresh the connection.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reload Console</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
