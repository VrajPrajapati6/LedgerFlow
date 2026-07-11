"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLoader } from "@/components/feedback/Loader";
import { DashboardHeader } from "@/features/dashboard/DashboardHeader";
import { KPICards } from "@/features/dashboard/KPICards";
import { TransactionAnalytics } from "@/features/dashboard/TransactionAnalytics";
import { FinancialOverview } from "@/features/dashboard/FinancialOverview";
import { RecentTransactionsTable } from "@/features/dashboard/RecentTransactionsTable";
import { FraudSummary } from "@/features/dashboard/FraudSummary";
import { ReconciliationSummary } from "@/features/dashboard/ReconciliationSummary";
import { LedgerTimeline } from "@/features/dashboard/LedgerTimeline";
import { SystemHealthCards } from "@/features/dashboard/SystemHealthCards";
import {
  accountService,
  transactionService,
  ledgerService,
  snapshotService,
  fraudService,
  reconciliationService,
} from "@/services/api/endpoints";

export default function Dashboard() {
  // 1. Fetch Accounts
  const {
    data: accounts = [],
    isLoading: accountsLoading,
    refetch: refetchAccounts,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  // 2. Fetch Transactions
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionService.list,
  });

  // 3. Fetch Ledger Entries
  const {
    data: ledgerEntries = [],
    isLoading: ledgerLoading,
    refetch: refetchLedger,
  } = useQuery({
    queryKey: ["ledger"],
    queryFn: ledgerService.list,
  });

  // 4. Fetch Snapshots
  const {
    data: snapshots = [],
    isLoading: snapshotsLoading,
    refetch: refetchSnapshots,
  } = useQuery({
    queryKey: ["snapshots"],
    queryFn: snapshotService.list,
  });

  // 5. Fetch Fraud Alerts
  const {
    data: fraudAlerts = [],
    isLoading: fraudLoading,
    refetch: refetchFraud,
  } = useQuery({
    queryKey: ["fraudAlerts"],
    queryFn: fraudService.listAlerts,
  });

  // 6. Fetch Reconciliation Report (Handles 404/500 when no run exists)
  const {
    data: reconReport = null,
    isLoading: reconLoading,
    refetch: refetchRecon,
  } = useQuery({
    queryKey: ["reconciliationReport"],
    queryFn: async () => {
      try {
        return await reconciliationService.getReport();
      } catch {
        return null;
      }
    },
  });

  // 7. Fetch Reconciliation Failures (Handles 404/500 when no failures exist)
  const {
    data: reconFailures = [],
    isLoading: failuresLoading,
    refetch: refetchFailures,
  } = useQuery({
    queryKey: ["reconciliationFailures"],
    queryFn: async () => {
      try {
        return await reconciliationService.listFailures();
      } catch {
        return [];
      }
    },
  });

  const refetchAll = () => {
    refetchAccounts();
    refetchTransactions();
    refetchLedger();
    refetchSnapshots();
    refetchFraud();
    refetchRecon();
    refetchFailures();
  };

  const isLoading =
    accountsLoading ||
    transactionsLoading ||
    ledgerLoading ||
    snapshotsLoading ||
    fraudLoading ||
    reconLoading ||
    failuresLoading;

  if (isLoading) {
    return <PageLoader />;
  }

  // Calculate aggregated stats
  const totalAccounts = accounts.length;
  const totalTransactions = transactions.length;
  const totalLedgerEntries = ledgerEntries.length;

  const systemBalance = accounts.reduce(
    (acc, curr) => acc + (curr.balance || 0),
    0
  );

  const fraudAlertsCount = fraudAlerts.length;
  const failedReconciliations = reconFailures.length;
  const snapshotsCount = snapshots.length;

  const kpiStats = {
    totalAccounts,
    totalTransactions,
    totalLedgerEntries,
    systemBalance,
    fraudAlerts: fraudAlertsCount,
    failedReconciliations,
    snapshotsCount,
    systemHealth: "Operational",
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Clock and Dialog Modals */}
      <DashboardHeader accounts={accounts} refetchData={refetchAll} />

      {/* 2. Key Performance Indicators */}
      <KPICards stats={kpiStats} />

      {/* 3. Recharts Transaction Volume & Flow Analytics */}
      <TransactionAnalytics transactions={transactions} />

      {/* 4. Financial Sum Conservations & Snapshot Replay Performance */}
      <FinancialOverview
        ledgerEntries={ledgerEntries}
        snapshotsCount={snapshotsCount}
      />

      {/* 5. Main Double-Entry Transactions Log Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactionsTable transactions={transactions} />
        </div>
        {/* 6. Fraud Alert center */}
        <div>
          <FraudSummary alerts={fraudAlerts} />
        </div>
      </div>

      {/* 7. Reconciliation anomalies, raw timelines, and host healths */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReconciliationSummary report={reconReport} failures={reconFailures} />
        <LedgerTimeline
          ledgerEntries={ledgerEntries}
          snapshots={snapshots}
          fraudAlerts={fraudAlerts}
          reconciliationReport={reconReport}
        />
      </div>

      {/* 8. Infrastructure telemetry status */}
      <SystemHealthCards />
    </div>
  );
}
