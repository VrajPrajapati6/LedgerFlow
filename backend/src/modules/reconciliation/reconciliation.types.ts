export interface CreateExternalSettlementInput {
  transactionId: string;
  amount: number;
  status: "SUCCESS" | "FAILED";
  settlementTimestamp: Date | string;
}

export interface ExternalSettlementDTO {
  id: string;
  transactionId: string;
  amount: number;
  status: string;
  settlementTimestamp: Date;
  createdAt: Date;
}

export interface MismatchFailure {
  transactionId: string;
  mismatchType: "MISSING_SETTLEMENT" | "AMOUNT_MISMATCH" | "STATUS_MISMATCH" | "DUPLICATE_SETTLEMENT";
  details: string;
}

export interface ReconciliationRunResult {
  runId: string;
  totalMatched: number;
  totalMismatched: number;
  failures: MismatchFailure[];
  createdAt: Date;
}

export interface ReconciliationReport {
  runId: string;
  totalMatched: number;
  totalMismatched: number;
  failuresCount: {
    MISSING_SETTLEMENT: number;
    AMOUNT_MISMATCH: number;
    STATUS_MISMATCH: number;
    DUPLICATE_SETTLEMENT: number;
  };
  createdAt: Date;
}
