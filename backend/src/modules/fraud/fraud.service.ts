import prisma from "../../config/prisma.js";
import type { FraudAnalysisResult, FraudAlertDTO } from "./fraud.types.js";

export const analyzeTransaction = async (
  transactionId: string
): Promise<FraudAnalysisResult> => {
  // Fetch transaction with its ledger entries
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      ledgerEntries: true,
    },
  });

  if (!transaction) {
    throw new Error(`Transaction with ID ${transactionId} not found`);
  }

  // A valid double-entry transfer transaction will have a DEBIT and a CREDIT entry
  const debitEntry = transaction.ledgerEntries.find((e) => e.entryType === "DEBIT");
  const creditEntry = transaction.ledgerEntries.find((e) => e.entryType === "CREDIT");

  if (!debitEntry || !creditEntry) {
    throw new Error(`Transaction with ID ${transactionId} is not a valid double-entry transfer`);
  }

  const accountId = debitEntry.accountId;
  const receiverAccountId = creditEntry.accountId;
  const amount = Number(debitEntry.amount);
  const txTime = transaction.createdAt;

  let riskScore = 0;
  const triggeredRules: string[] = [];

  // === Rule 1: Velocity Check (+40 points) ===
  // Check if there are > 5 transfers (DEBIT entries) within the 1-minute window of the transaction's timestamp
  const oneMinuteBefore = new Date(txTime.getTime() - 60000);
  const recentDebitsCount = await prisma.ledgerEntry.count({
    where: {
      accountId,
      entryType: "DEBIT",
      createdAt: {
        gte: oneMinuteBefore,
        lte: txTime,
      },
    },
  });

  if (recentDebitsCount > 5) {
    riskScore += 40;
    triggeredRules.push("VELOCITY_LIMIT_EXCEEDED");
  }

  // === Rule 2: Repeated Amount Pattern (+20 points) ===
  // Check if the same amount was transferred 3+ times consecutively (including this transfer)
  const lastThreeDebits = await prisma.ledgerEntry.findMany({
    where: {
      accountId,
      entryType: "DEBIT",
      createdAt: {
        lte: txTime,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  if (lastThreeDebits.length >= 3) {
    const amt0 = Number(lastThreeDebits[0]?.amount);
    const amt1 = Number(lastThreeDebits[1]?.amount);
    const amt2 = Number(lastThreeDebits[2]?.amount);
    if (amt0 === amt1 && amt1 === amt2) {
      riskScore += 20;
      triggeredRules.push("REPEATED_AMOUNT_PATTERN");
    }
  }

  // === Rule 3: Large Transfer Spike (+30 points) ===
  // Check if current transaction amount is > 3x the average of all historical transfers (excluding this one)
  const historicalDebits = await prisma.ledgerEntry.findMany({
    where: {
      accountId,
      entryType: "DEBIT",
      id: {
        not: debitEntry.id,
      },
      createdAt: {
        lt: txTime,
      },
    },
    select: { amount: true },
  });

  if (historicalDebits.length > 0) {
    const sum = historicalDebits.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const avg = sum / historicalDebits.length;
    if (amount > 3 * avg) {
      riskScore += 30;
      triggeredRules.push("LARGE_TRANSFER_SPIKE");
    }
  }

  // === Rule 4: Circular Transfer Check (+20 points) ===
  // Check if B -> A transfer occurred in the 10 minutes prior to this A -> B transfer
  const tenMinutesBefore = new Date(txTime.getTime() - 10 * 60000);
  const circularTx = await prisma.transaction.findFirst({
    where: {
      createdAt: {
        gte: tenMinutesBefore,
        lt: txTime,
      },
      ledgerEntries: {
        some: {
          accountId: receiverAccountId,
          entryType: "DEBIT",
        },
      },
    },
    include: {
      ledgerEntries: true,
    },
  });

  if (circularTx) {
    const hasCreditToA = circularTx.ledgerEntries.some(
      (e) => e.accountId === accountId && e.entryType === "CREDIT"
    );
    if (hasCreditToA) {
      riskScore += 20;
      triggeredRules.push("CIRCULAR_TRANSFER");
    }
  }

  // Calculate severity based on aggregated score (cap at 100)
  if (riskScore > 100) riskScore = 100;

  let severity: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (riskScore > 70) {
    severity = "HIGH";
  } else if (riskScore > 30) {
    severity = "MEDIUM";
  }

  // Persist fraud alert in the database for auditing (only if not already created)
  const existingAlert = await prisma.fraudAlert.findFirst({
    where: { transactionId },
  });

  if (!existingAlert) {
    await prisma.fraudAlert.create({
      data: {
        transactionId,
        accountId,
        riskScore,
        severity,
        triggeredRules,
      },
    });
  }

  return {
    transactionId,
    accountId,
    riskScore,
    severity,
    triggeredRules,
  };
};

export const getSuspiciousAlerts = async (): Promise<FraudAlertDTO[]> => {
  const alerts = await prisma.fraudAlert.findMany({
    orderBy: { createdAt: "desc" },
  });

  return alerts.map((alert) => ({
    id: alert.id,
    transactionId: alert.transactionId,
    accountId: alert.accountId,
    riskScore: alert.riskScore,
    severity: alert.severity,
    triggeredRules: alert.triggeredRules,
    createdAt: alert.createdAt,
  }));
};

export const getAccountFraudHistory = async (
  accountId: string
): Promise<FraudAlertDTO[]> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error(`Account with ID ${accountId} not found`);
  }

  const alerts = await prisma.fraudAlert.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
  });

  return alerts.map((alert) => ({
    id: alert.id,
    transactionId: alert.transactionId,
    accountId: alert.accountId,
    riskScore: alert.riskScore,
    severity: alert.severity,
    triggeredRules: alert.triggeredRules,
    createdAt: alert.createdAt,
  }));
};
