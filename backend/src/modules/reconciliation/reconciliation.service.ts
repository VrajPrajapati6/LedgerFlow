import prisma from "../../config/prisma.js";
import type {
  CreateExternalSettlementInput,
  ExternalSettlementDTO,
  MismatchFailure,
  ReconciliationRunResult,
  ReconciliationReport,
} from "./reconciliation.types.js";

/**
 * Creates a mock external settlement record for testing.
 */
export const createMockSettlement = async (
  input: CreateExternalSettlementInput
): Promise<ExternalSettlementDTO> => {
  const settlement = await prisma.externalSettlement.create({
    data: {
      transactionId: input.transactionId,
      amount: input.amount,
      status: input.status,
      settlementTimestamp: new Date(input.settlementTimestamp),
    },
  });

  return {
    id: settlement.id,
    transactionId: settlement.transactionId,
    amount: Number(settlement.amount),
    status: settlement.status,
    settlementTimestamp: settlement.settlementTimestamp,
    createdAt: settlement.createdAt,
  };
};

/**
 * Runs the reconciliation algorithm: compares all internal transactions against
 * external settlements and records mismatches.
 */
export const runReconciliation = async (): Promise<ReconciliationRunResult> => {
  // 1. Fetch all internal transactions with their ledger entries
  const transactions = await prisma.transaction.findMany({
    include: {
      ledgerEntries: true,
    },
  });

  // 2. Fetch all external settlements
  const externalSettlements = await prisma.externalSettlement.findMany();

  // Group external settlements by transactionId for O(1) lookup
  const externalMap = new Map<string, typeof externalSettlements>();
  for (const settlement of externalSettlements) {
    const list = externalMap.get(settlement.transactionId) || [];
    list.push(settlement);
    externalMap.set(settlement.transactionId, list);
  }

  const failures: MismatchFailure[] = [];
  let totalMatched = 0;
  let totalMismatched = 0;

  for (const tx of transactions) {
    const debitEntry = tx.ledgerEntries.find((e) => e.entryType === "DEBIT");
    const creditEntry = tx.ledgerEntries.find((e) => e.entryType === "CREDIT");
    const internalAmount = debitEntry
      ? Number(debitEntry.amount)
      : creditEntry
      ? Number(creditEntry.amount)
      : 0;

    const matchingSettlements = externalMap.get(tx.id) || [];
    let hasMismatch = false;

    // Rule 1: Missing External Record
    if (matchingSettlements.length === 0) {
      failures.push({
        transactionId: tx.id,
        mismatchType: "MISSING_SETTLEMENT",
        details: `Internal transaction exists but no external settlement record was found.`,
      });
      hasMismatch = true;
    }
    // Rule 4: Duplicate Settlement
    else if (matchingSettlements.length > 1) {
      failures.push({
        transactionId: tx.id,
        mismatchType: "DUPLICATE_SETTLEMENT",
        details: `Found ${matchingSettlements.length} external settlement records for this transaction.`,
      });
      hasMismatch = true;
    }
    // Exactly one external settlement - check details
    else {
      const settlement = matchingSettlements[0]!;
      const extAmount = Number(settlement.amount);

      // Rule 2: Amount Mismatch
      if (internalAmount !== extAmount) {
        failures.push({
          transactionId: tx.id,
          mismatchType: "AMOUNT_MISMATCH",
          details: `Internal amount is ${internalAmount}, but external settlement amount is ${extAmount}.`,
        });
        hasMismatch = true;
      }

      // Rule 3: Status Mismatch
      // Internal SUCCESS, External FAILED
      if (tx.status === "SUCCESS" && settlement.status === "FAILED") {
        failures.push({
          transactionId: tx.id,
          mismatchType: "STATUS_MISMATCH",
          details: `Internal transaction status is SUCCESS, but external settlement status is FAILED.`,
        });
        hasMismatch = true;
      }
    }

    if (hasMismatch) {
      totalMismatched++;
    } else {
      totalMatched++;
    }
  }

  // 3. Persist the reconciliation run results to guarantee immutability
  const result = await prisma.$transaction(async (prismaTx) => {
    const run = await prismaTx.reconciliationRun.create({
      data: {
        totalMatched,
        totalMismatched,
      },
    });

    if (failures.length > 0) {
      await prismaTx.reconciliationFailure.createMany({
        data: failures.map((f) => ({
          runId: run.id,
          transactionId: f.transactionId,
          mismatchType: f.mismatchType,
          details: f.details,
        })),
      });
    }

    return run;
  });

  return {
    runId: result.id,
    totalMatched,
    totalMismatched,
    failures,
    createdAt: result.createdAt,
  };
};

/**
 * Returns the reconciliation report from the latest run.
 */
export const getLatestReport = async (): Promise<ReconciliationReport | null> => {
  const latestRun = await prisma.reconciliationRun.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      failures: true,
    },
  });

  if (!latestRun) {
    return null;
  }

  const failuresCount = {
    MISSING_SETTLEMENT: 0,
    AMOUNT_MISMATCH: 0,
    STATUS_MISMATCH: 0,
    DUPLICATE_SETTLEMENT: 0,
  };

  for (const failure of latestRun.failures) {
    const type = failure.mismatchType as keyof typeof failuresCount;
    if (type in failuresCount) {
      failuresCount[type]++;
    }
  }

  return {
    runId: latestRun.id,
    totalMatched: latestRun.totalMatched,
    totalMismatched: latestRun.totalMismatched,
    failuresCount,
    createdAt: latestRun.createdAt,
  };
};

/**
 * Returns failed reconciliation cases (failures from the latest run, or all historically).
 */
export const getFailedReconciliations = async (
  latestOnly: boolean = true
): Promise<any[]> => {
  if (latestOnly) {
    const latestRun = await prisma.reconciliationRun.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        failures: true,
      },
    });

    return latestRun ? latestRun.failures : [];
  }

  return await prisma.reconciliationFailure.findMany({
    orderBy: { createdAt: "desc" },
  });
};
