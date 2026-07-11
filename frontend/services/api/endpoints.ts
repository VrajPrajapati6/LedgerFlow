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

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const accountService = {
  list: async () => {
    const response = await apiClient<ApiEnvelope<Account[]>>("/accounts");
    return Array.isArray(response.data) ? response.data : [];
  },
  create: async (data: { userId: string; accountType: string; currency: string }) => {
    const response = await apiClient<ApiEnvelope<Account>>("/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },
  get: async (id: string) => {
    const response = await apiClient<ApiEnvelope<Account>>(`/accounts/${id}`);
    return response.data;
  },
};

export const transactionService = {
  list: async () => {
    const response = await apiClient<ApiEnvelope<Transaction[]>>("/transactions");
    return Array.isArray(response.data) ? response.data : [];
  },
  get: async (id: string) => {
    const response = await apiClient<ApiEnvelope<Transaction>>(`/transactions/${id}`);
    return response.data;
  },
  transfer: async (data: {
    senderId: string;
    receiverId: string;
    amount: number;
    description?: string;
  }) => {
    const response = await apiClient<ApiEnvelope<{ transactionId: string }>>("/transactions/transfer", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },
  deposit: async (data: {
    accountId: string;
    amount: number;
    description?: string;
  }) => {
    const response = await apiClient<ApiEnvelope<{ transactionId: string }>>("/transactions/deposit", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },
};

export const ledgerService = {
  list: async () => {
    const response = await apiClient<ApiEnvelope<LedgerEntry[]>>("/ledger");
    return Array.isArray(response.data) ? response.data : [];
  },
  getHistory: async (accountId: string) => {
    const response = await apiClient<ApiEnvelope<LedgerEntry[]>>(`/ledger/${accountId}/history`);
    return Array.isArray(response.data) ? response.data : [];
  },
  getBalance: async (accountId: string) => {
    const response = await apiClient<ApiEnvelope<{ balance: number }>>(`/ledger/${accountId}/balance`);
    return response.data;
  },
  getBalanceAt: async (accountId: string, timestamp: string) => {
    const response = await apiClient<ApiEnvelope<{ balance: number }>>(
      `/ledger/${accountId}/balance-at?timestamp=${encodeURIComponent(timestamp)}`
    );
    return response.data;
  },
};

export const snapshotService = {
  list: async () => {
    const response = await apiClient<ApiEnvelope<Snapshot[]>>("/snapshots");
    return Array.isArray(response.data) ? response.data : [];
  },
  create: async (accountId: string) => {
    const response = await apiClient<ApiEnvelope<Snapshot>>(`/snapshots/${accountId}/create`, {
      method: "POST",
    });
    return response.data;
  },
  getLatest: async (accountId: string) => {
    const response = await apiClient<ApiEnvelope<Snapshot>>(`/snapshots/${accountId}/latest`);
    return response.data;
  },
};

export const fraudService = {
  listAlerts: async () => {
    const response = await apiClient<ApiEnvelope<FraudAlert[]>>("/fraud/alerts");
    return Array.isArray(response.data) ? response.data : [];
  },
  analyze: async (transactionId: string) => {
    const response = await apiClient<ApiEnvelope<{ fraudAlert: FraudAlert }>>(
      `/fraud/analyze/${transactionId}`,
      {
        method: "POST",
      }
    );
    return response.data;
  },
  getAccountHistory: async (accountId: string) => {
    const response = await apiClient<ApiEnvelope<FraudAlert[]>>(
      `/fraud/${accountId}/history`
    );
    return Array.isArray(response.data) ? response.data : [];
  },
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
