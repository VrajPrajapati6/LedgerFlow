import { apiClient } from "./client";
import {
  Account,
  Transaction,
  LedgerEntry,
  Snapshot,
  FraudAlert,
  ReconciliationReport,
  ReconciliationFailure,
} from "@/types";

export const accountService = {
  list: () => apiClient<Account[]>("/accounts"),
  create: (data: { userId: string; accountType: string; currency: string }) =>
    apiClient<Account>("/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  get: (id: string) => apiClient<Account>(`/accounts/${id}`),
};

export const transactionService = {
  list: () => apiClient<Transaction[]>("/transactions"),
  get: (id: string) => apiClient<Transaction>(`/transactions/${id}`),
  transfer: (data: {
    senderId: string;
    receiverId: string;
    amount: number;
    description?: string;
  }) =>
    apiClient<{ transactionId: string }>("/transactions/transfer", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deposit: (data: {
    accountId: string;
    amount: number;
    description?: string;
  }) =>
    apiClient<{ transactionId: string }>("/transactions/deposit", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const ledgerService = {
  list: () => apiClient<LedgerEntry[]>("/ledger"),
  getHistory: (accountId: string) =>
    apiClient<LedgerEntry[]>(`/ledger/${accountId}/history`),
  getBalance: (accountId: string) =>
    apiClient<{ balance: number }>(`/ledger/${accountId}/balance`),
  getBalanceAt: (accountId: string, timestamp: string) =>
    apiClient<{ balance: number }>(
      `/ledger/${accountId}/balance-at?timestamp=${encodeURIComponent(
        timestamp
      )}`
    ),
};

export const snapshotService = {
  list: () => apiClient<Snapshot[]>("/snapshots"),
  create: (accountId: string) =>
    apiClient<Snapshot>(`/snapshots/${accountId}/create`, {
      method: "POST",
    }),
  getLatest: (accountId: string) =>
    apiClient<Snapshot>(`/snapshots/${accountId}/latest`),
};

export const fraudService = {
  listAlerts: () => apiClient<FraudAlert[]>("/fraud/alerts"),
  analyze: (transactionId: string) =>
    apiClient<{ fraudAlert: FraudAlert }>(`/fraud/analyze/${transactionId}`, {
      method: "POST",
    }),
  getAccountHistory: (accountId: string) =>
    apiClient<FraudAlert[]>(`/fraud/${accountId}/history`),
};

export const reconciliationService = {
  getReport: () => apiClient<ReconciliationReport>("/reconciliation/report"),
  listFailures: () =>
    apiClient<ReconciliationFailure[]>("/reconciliation/failures"),
  run: () =>
    apiClient<{ report: ReconciliationReport }>("/reconciliation/run", {
      method: "POST",
    }),
};
