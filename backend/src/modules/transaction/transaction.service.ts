import prisma from "../../config/prisma.js";
import type { TransferInput, TransferResult } from "./transaction.types.js";

export const executeTransfer = async (
  input: TransferInput
): Promise<TransferResult> => {
  const { fromAccountId, toAccountId, amount } = input;

  // 1. Fetch both accounts (outside of transaction)
  const fromAccount = await prisma.account.findUnique({
    where: { id: fromAccountId },
  });
  if (!fromAccount) {
    throw new Error(`Sender account with ID ${fromAccountId} not found`);
  }

  const toAccount = await prisma.account.findUnique({
    where: { id: toAccountId },
  });
  if (!toAccount) {
    throw new Error(`Receiver account with ID ${toAccountId} not found`);
  }

  // 2. Reconstruct Sender Balance using pure event replay of ledger entries (outside of transaction)
  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { accountId: fromAccountId },
    select: { entryType: true, amount: true },
  });

  let senderBalance = 0;
  for (const entry of ledgerEntries) {
    const val = Number(entry.amount);
    if (entry.entryType === "CREDIT") {
      senderBalance += val;
    } else if (entry.entryType === "DEBIT") {
      senderBalance -= val;
    }
  }

  // 3. Check sufficient funds
  if (senderBalance < amount) {
    throw new Error(`Insufficient funds: account balance is ${senderBalance}, transfer amount is ${amount}`);
  }

  // 4. Create write operations within a transaction to maintain double-entry consistency
  return await prisma.$transaction(async (tx) => {
    const reference = `TX-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const transaction = await tx.transaction.create({
      data: {
        reference,
        status: "SUCCESS",
      },
    });

    // 5. Create Debit Ledger Entry for Sender
    await tx.ledgerEntry.create({
      data: {
        accountId: fromAccountId,
        transactionId: transaction.id,
        entryType: "DEBIT",
        amount,
        description: `Transfer of ${amount} to account ${toAccountId}`,
      },
    });

    // 6. Create Credit Ledger Entry for Receiver
    await tx.ledgerEntry.create({
      data: {
        accountId: toAccountId,
        transactionId: transaction.id,
        entryType: "CREDIT",
        amount,
        description: `Transfer of ${amount} from account ${fromAccountId}`,
      },
    });

    return {
      transactionId: transaction.id,
      reference,
      fromAccountId,
      toAccountId,
      amount,
      createdAt: transaction.createdAt,
    };
  });
};

export const getTransactions = async (filters: {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) => {
  const whereClause: any = {};

  if (filters.status) {
    whereClause.status = filters.status;
  }

  if (filters.search) {
    whereClause.OR = [
      { id: { contains: filters.search, mode: "insensitive" } },
      { reference: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: {
      ledgerEntries: true,
      fraudAlerts: true,
    },
    orderBy: filters.sortBy
      ? { [filters.sortBy]: filters.sortOrder || "desc" }
      : { createdAt: "desc" },
    take: filters.limit || 50,
    skip: filters.offset || 0,
  });

  const totalCount = await prisma.transaction.count({ where: whereClause });

  const formatted = transactions.map((tx) => {
    const debitEntry = tx.ledgerEntries.find((e) => e.entryType === "DEBIT");
    const creditEntry = tx.ledgerEntries.find((e) => e.entryType === "CREDIT");

    const amount = debitEntry
      ? Number(debitEntry.amount)
      : creditEntry
      ? Number(creditEntry.amount)
      : 0;

    const sender = debitEntry ? debitEntry.accountId : null;
    const receiver = creditEntry ? creditEntry.accountId : null;

    const riskAlert = tx.fraudAlerts[0];
    const riskScore = riskAlert ? riskAlert.riskScore : 0;

    return {
      id: tx.id,
      reference: tx.reference,
      status: tx.status,
      createdAt: tx.createdAt,
      amount,
      sender,
      receiver,
      riskScore,
    };
  });

  return {
    transactions: formatted,
    totalCount,
  };
};

export const getTransactionById = async (id: string) => {
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: {
      ledgerEntries: {
        include: {
          account: true,
        },
      },
      fraudAlerts: true,
    },
  });

  if (!tx) return null;

  const debitEntry = tx.ledgerEntries.find((e) => e.entryType === "DEBIT");
  const creditEntry = tx.ledgerEntries.find((e) => e.entryType === "CREDIT");

  const amount = debitEntry
    ? Number(debitEntry.amount)
    : creditEntry
    ? Number(creditEntry.amount)
    : 0;

  const sender = debitEntry ? debitEntry.accountId : null;
  const receiver = creditEntry ? creditEntry.accountId : null;

  const riskAlert = tx.fraudAlerts[0];
  const riskScore = riskAlert ? riskAlert.riskScore : 0;

  return {
    id: tx.id,
    reference: tx.reference,
    status: tx.status,
    createdAt: tx.createdAt,
    amount,
    sender,
    receiver,
    riskScore,
    ledgerEntries: tx.ledgerEntries.map((e) => ({
      id: e.id,
      accountId: e.accountId,
      accountType: e.account.accountType,
      currency: e.account.currency,
      entryType: e.entryType,
      amount: Number(e.amount),
      description: e.description,
      createdAt: e.createdAt,
    })),
    fraudAlerts: tx.fraudAlerts,
  };
};
