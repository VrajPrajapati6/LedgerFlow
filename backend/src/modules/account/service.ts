import prisma from "../../config/prisma.js";
import type { CreateAccountInput } from "./types.js";

export const createAccount = async (
  data: CreateAccountInput
) => {
  const account = await prisma.account.create({
    data,
  });

  return account;
};

export const getAccounts = async () => {
  const accounts = await prisma.account.findMany({
    include: {
      _count: {
        select: { ledgerEntries: true },
      },
      ledgerEntries: {
        select: { entryType: true, amount: true },
      },
    },
  });

  return accounts.map((account) => {
    let balance = 0;
    for (const entry of account.ledgerEntries) {
      const val = Number(entry.amount);
      if (entry.entryType === "CREDIT") {
        balance += val;
      } else if (entry.entryType === "DEBIT") {
        balance -= val;
      }
    }

    return {
      id: account.id,
      userId: account.userId,
      accountType: account.accountType,
      currency: account.currency,
      status: account.status,
      createdAt: account.createdAt,
      transactionsCount: account._count.ledgerEntries,
      balance,
    };
  });
};

export const getAccountById = async (id: string) => {
  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      _count: {
        select: { ledgerEntries: true },
      },
      ledgerEntries: {
        select: { entryType: true, amount: true },
      },
    },
  });

  if (!account) {
    return null;
  }

  let balance = 0;
  for (const entry of account.ledgerEntries) {
    const val = Number(entry.amount);
    if (entry.entryType === "CREDIT") {
      balance += val;
    } else if (entry.entryType === "DEBIT") {
      balance -= val;
    }
  }

  return {
    id: account.id,
    userId: account.userId,
    accountType: account.accountType,
    currency: account.currency,
    status: account.status,
    createdAt: account.createdAt,
    transactionsCount: account._count.ledgerEntries,
    balance,
  };
};
