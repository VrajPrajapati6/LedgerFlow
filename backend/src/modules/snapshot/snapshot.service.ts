import prisma from "../../config/prisma.js";
import type { SnapshotDTO, OptimizedBalanceResponse } from "./snapshot.types.js";

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

export const createAccountSnapshot = async (
  accountId: string
): Promise<SnapshotDTO> => {
  await fetchAccountOrThrow(accountId);

  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { accountId },
    orderBy: { createdAt: "asc" },
  });

  if (ledgerEntries.length === 0) {
    throw new Error(`Cannot create snapshot: Account with ID ${accountId} has no transactions`);
  }

  let balance = 0;
  for (const entry of ledgerEntries) {
    const val = Number(entry.amount);
    if (entry.entryType === "CREDIT") {
      balance += val;
    } else if (entry.entryType === "DEBIT") {
      balance -= val;
    }
  }

  const lastEntry = ledgerEntries[ledgerEntries.length - 1];
  if (!lastEntry) {
    throw new Error("Unable to determine latest ledger entry");
  }

  const snapshot = await prisma.snapshot.create({
    data: {
      accountId,
      balance,
      lastEventId: lastEntry.id,
    },
  });

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    balance: Number(snapshot.balance),
    lastEventId: snapshot.lastEventId,
    createdAt: snapshot.createdAt,
  };
};

export const getLatestSnapshot = async (
  accountId: string
): Promise<SnapshotDTO | null> => {
  await fetchAccountOrThrow(accountId);

  const snapshot = await prisma.snapshot.findFirst({
    where: { accountId },
    orderBy: { createdAt: "desc" },
  });

  if (!snapshot) {
    return null;
  }

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    balance: Number(snapshot.balance),
    lastEventId: snapshot.lastEventId,
    createdAt: snapshot.createdAt,
  };
};

export const getOptimizedBalance = async (
  accountId: string
): Promise<OptimizedBalanceResponse> => {
  const account = await fetchAccountOrThrow(accountId);

  const latestSnapshot = await prisma.snapshot.findFirst({
    where: { accountId },
    orderBy: { createdAt: "desc" },
  });

  const fullReplayFallback = async (): Promise<OptimizedBalanceResponse> => {
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
      reconstructedFrom: "FULL_REPLAY",
    };
  };

  if (!latestSnapshot) {
    return await fullReplayFallback();
  }

  const lastEvent = await prisma.ledgerEntry.findUnique({
    where: { id: latestSnapshot.lastEventId },
  });

  if (!lastEvent) {
    // If the anchor ledger entry for the snapshot is missing, fallback to full event replay
    return await fullReplayFallback();
  }

  // Fetch all ledger entries starting from the snapshot's anchor timestamp
  const entries = await prisma.ledgerEntry.findMany({
    where: {
      accountId,
      createdAt: {
        gte: lastEvent.createdAt,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Find the exact index of the snapshot anchor to avoid millisecond collisions
  const anchorIndex = entries.findIndex((e) => e.id === lastEvent.id);
  if (anchorIndex === -1) {
    return await fullReplayFallback();
  }

  // Sliced list represents only the entries that occurred strictly AFTER the snapshot
  const recentEntries = entries.slice(anchorIndex + 1);

  let balance = Number(latestSnapshot.balance);
  for (const entry of recentEntries) {
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
    reconstructedFrom: "SNAPSHOT",
    snapshotId: latestSnapshot.id,
    snapshotTimestamp: latestSnapshot.createdAt,
  };
};

export const getSnapshots = async () => {
  const snapshots = await prisma.snapshot.findMany({
    include: {
      account: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return snapshots.map((s) => ({
    id: s.id,
    accountId: s.accountId,
    accountType: s.account.accountType,
    currency: s.account.currency,
    balance: Number(s.balance),
    lastEventId: s.lastEventId,
    createdAt: s.createdAt,
  }));
};
