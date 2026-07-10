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
