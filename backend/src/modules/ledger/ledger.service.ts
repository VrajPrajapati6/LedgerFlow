import prisma from "../../config/prisma.js";
import type { LedgerHistoryItem, BalanceResponse, BalanceAtResponse } from "./ledger.types.js";

async function fetchAccountOrThrow(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { id: true, currency: true },
  });
  if (!account) {
    throw new Error(`Account with ID ${accountId} not found`);
  }
  return account;
}

export const getAccountHistory = async (
  accountId: string
): Promise<LedgerHistoryItem[]> => {
  await fetchAccountOrThrow(accountId);

  const entries = await prisma.ledgerEntry.findMany({
    where: { accountId },
    orderBy: { createdAt: "asc" },
    select: {
      transactionId: true,
      entryType: true,
      amount: true,
      description: true,
      createdAt: true,
    },
  });

  return entries.map((entry) => ({
    transactionId: entry.transactionId,
    entryType: entry.entryType,
    amount: Number(entry.amount),
    description: entry.description,
    timestamp: entry.createdAt,
  }));
};

export const getCurrentBalance = async (
  accountId: string
): Promise<BalanceResponse> => {
  const account = await fetchAccountOrThrow(accountId);

  const entries = await prisma.ledgerEntry.findMany({
    where: { accountId },
    select: { entryType: true, amount: true },
  });

  let balance = 0;
  for (const entry of entries) {
    const val = Number(entry.amount);
    if (entry.entryType === "CREDIT") {
      balance += val;
    } else if (entry.entryType === "DEBIT") {
      balance -= val;
    }
  }

  return {
    accountId,
    balance,
    currency: account.currency,
  };
};

export const getBalanceAtTimestamp = async (
  accountId: string,
  timestamp: Date
): Promise<BalanceAtResponse> => {
  const account = await fetchAccountOrThrow(accountId);

  const entries = await prisma.ledgerEntry.findMany({
    where: {
      accountId,
      createdAt: {
        lte: timestamp,
      },
    },
    select: { entryType: true, amount: true },
  });

  let balance = 0;
  for (const entry of entries) {
    const val = Number(entry.amount);
    if (entry.entryType === "CREDIT") {
      balance += val;
    } else if (entry.entryType === "DEBIT") {
      balance -= val;
    }
  }

  return {
    accountId,
    balance,
    timestamp,
    currency: account.currency,
  };
};

export const getLedgerEntries = async (filters: {
  accountId?: string;
  transactionId?: string;
  entryType?: "DEBIT" | "CREDIT";
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) => {
  const whereClause: any = {};

  if (filters.accountId) {
    whereClause.accountId = filters.accountId;
  }
  if (filters.transactionId) {
    whereClause.transactionId = filters.transactionId;
  }
  if (filters.entryType) {
    whereClause.entryType = filters.entryType;
  }
  if (filters.startDate || filters.endDate) {
    whereClause.createdAt = {};
    if (filters.startDate) {
      whereClause.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      whereClause.createdAt.lte = filters.endDate;
    }
  }

  const entries = await prisma.ledgerEntry.findMany({
    where: whereClause,
    include: {
      account: true,
      transaction: true,
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit || 50,
    skip: filters.offset || 0,
  });

  const totalCount = await prisma.ledgerEntry.count({ where: whereClause });

  const formatted = entries.map((e) => ({
    id: e.id,
    accountId: e.accountId,
    accountType: e.account.accountType,
    currency: e.account.currency,
    transactionId: e.transactionId,
    transactionReference: e.transaction.reference,
    transactionStatus: e.transaction.status,
    entryType: e.entryType,
    amount: Number(e.amount),
    description: e.description,
    createdAt: e.createdAt,
  }));

  return {
    entries: formatted,
    totalCount,
  };
};
