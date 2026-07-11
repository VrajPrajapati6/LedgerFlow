export type AccountStatus = "ACTIVE" | "BLOCKED" | "CLOSED";
export type EntryType = "DEBIT" | "CREDIT";
export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "REVERSED";
export type FraudSeverity = "LOW" | "MEDIUM" | "HIGH";
export type ReconciliationMismatchType =
  | "MISSING_SETTLEMENT"
  | "AMOUNT_MISMATCH"
  | "STATUS_MISMATCH"
  | "DUPLICATE_SETTLEMENT";

export interface Account {
  id: string;
  userId: string;
  accountType: string;
  currency: string;
  status: AccountStatus;
  createdAt: string;
  balance?: number; // custom hydrated balance
}

export interface Transaction {
  id: string;
  reference: string | null;
  status: TransactionStatus;
  createdAt: string;
  amount?: number; // custom aggregated amount
  sender?: string; // custom hydrated sender
  receiver?: string; // custom hydrated receiver
  riskScore?: number; // custom hydrated risk score
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  transactionId: string;
  entryType: EntryType;
  amount: number | string;
  description: string | null;
  createdAt: string;
}

export interface Snapshot {
  id: string;
  accountId: string;
  balance: number | string;
  lastEventId: string;
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  accountId: string;
  riskScore: number;
  severity: FraudSeverity;
  triggeredRules: string[];
  createdAt: string;
}

export interface ExternalSettlement {
  id: string;
  transactionId: string;
  amount: number | string;
  status: "SUCCESS" | "FAILED";
  settlementTimestamp: string;
  createdAt: string;
}

export interface ReconciliationRun {
  id: string;
  totalMatched: number;
  totalMismatched: number;
  createdAt: string;
}

export interface ReconciliationFailure {
  id: string;
  runId: string;
  transactionId: string;
  mismatchType: ReconciliationMismatchType;
  details: string | null;
  createdAt: string;
}

export interface ReconciliationReport {
  runId: string;
  totalMatched: number;
  totalMismatched: number;
  failuresCount: Record<ReconciliationMismatchType, number>;
  createdAt: string;
}
