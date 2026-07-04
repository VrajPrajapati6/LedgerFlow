import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL ?? "" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getBalance(accountId: string): Promise<number> {
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
  return balance;
}

async function makeTransfer(fromAccountId: string, toAccountId: string, amount: number): Promise<string> {
  const res = await fetch("http://localhost:5000/transactions/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromAccountId, toAccountId, amount }),
  });
  const json = (await res.json()) as any;
  if (!json.success) {
    throw new Error(`Transfer failed: ${json.message}`);
  }
  return json.data.transactionId;
}

async function createExternalSettlement(transactionId: string, amount: number, status: "SUCCESS" | "FAILED") {
  const res = await fetch("http://localhost:5000/reconciliation/mock-settlement", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactionId,
      amount,
      status,
      settlementTimestamp: new Date().toISOString(),
    }),
  });
  const json = (await res.json()) as any;
  if (!json.success) {
    throw new Error(`Failed to create external settlement: ${json.message}`);
  }
  return json.data;
}

async function runReconciliation() {
  const res = await fetch("http://localhost:5000/reconciliation/run", {
    method: "POST",
  });
  const json = (await res.json()) as any;
  if (!json.success) {
    throw new Error(`Reconciliation run failed: ${json.message}`);
  }
  return json.data;
}

async function getReport() {
  const res = await fetch("http://localhost:5000/reconciliation/report");
  const json = (await res.json()) as any;
  if (!json.success) {
    throw new Error(`Failed to get report: ${json.message}`);
  }
  return json.data;
}

async function getFailures() {
  const res = await fetch("http://localhost:5000/reconciliation/failures?latestOnly=true");
  const json = (await res.json()) as any;
  if (!json.success) {
    throw new Error(`Failed to get failures: ${json.message}`);
  }
  return json.data;
}

async function run() {
  console.log("=== STARTING RECONCILIATION ENGINE VERIFICATION ===");

  // 1. Create accounts C and D
  console.log("\n1. Creating test accounts...");
  const resC = await fetch("http://localhost:5000/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: `recon_C_${Date.now()}`, accountType: "SAVINGS", currency: "USD" }),
  });
  const accountCJson = (await resC.json()) as any;
  const accountCId = accountCJson.data.id;

  const resD = await fetch("http://localhost:5000/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: `recon_D_${Date.now()}`, accountType: "SAVINGS", currency: "USD" }),
  });
  const accountDJson = (await resD.json()) as any;
  const accountDId = accountDJson.data.id;
  console.log(`Account C ID: ${accountCId}`);
  console.log(`Account D ID: ${accountDId}`);

  // 2. Fund Account C with 5,000 USD
  console.log("\n2. Funding Account C with 5,000 USD...");
  const depositTx = await prisma.transaction.create({ data: { reference: `RDEP-${Date.now()}`, status: "SUCCESS" } });
  await prisma.ledgerEntry.create({
    data: { accountId: accountCId, transactionId: depositTx.id, entryType: "CREDIT", amount: 5000, description: "Seed Funding" },
  });
  console.log(`Account C balance: ${await getBalance(accountCId)} USD`);

  // We need to create an external settlement for the funding transaction as well so it doesn't skew our count
  console.log("Creating matching external settlement for funding transaction...");
  await createExternalSettlement(depositTx.id, 5000, "SUCCESS");

  // 3. Perform 5 distinct transactions to test reconciliation rules
  console.log("\n3. Executing test transactions...");
  
  // Case A: Matched record (100 USD)
  console.log("  Executing Transaction 1: 100 USD (Matched)...");
  const tx1Id = await makeTransfer(accountCId, accountDId, 100);
  await createExternalSettlement(tx1Id, 100, "SUCCESS");

  // Case B: Amount mismatch (200 USD internally vs 150 USD externally)
  console.log("  Executing Transaction 2: 200 USD (Amount Mismatch)...");
  const tx2Id = await makeTransfer(accountCId, accountDId, 200);
  await createExternalSettlement(tx2Id, 150, "SUCCESS");

  // Case C: Status mismatch (300 USD, Internal SUCCESS vs External FAILED)
  console.log("  Executing Transaction 3: 300 USD (Status Mismatch)...");
  const tx3Id = await makeTransfer(accountCId, accountDId, 300);
  await createExternalSettlement(tx3Id, 300, "FAILED");

  // Case D: Duplicate settlement (400 USD, multiple external settlement records)
  console.log("  Executing Transaction 4: 400 USD (Duplicate Settlement)...");
  const tx4Id = await makeTransfer(accountCId, accountDId, 400);
  await createExternalSettlement(tx4Id, 400, "SUCCESS");
  await createExternalSettlement(tx4Id, 400, "SUCCESS");

  // Case E: Missing settlement (500 USD, no external settlement record created)
  console.log("  Executing Transaction 5: 500 USD (Missing Settlement)...");
  const tx5Id = await makeTransfer(accountCId, accountDId, 500);

  // 4. Trigger reconciliation run
  console.log("\n4. Triggering Reconciliation Run via API...");
  const runResult = await runReconciliation();
  console.log("Reconciliation Run Successful. Run ID:", runResult.runId);

  // 5. Fetch Reconciliation Report
  console.log("\n5. Fetching Latest Reconciliation Report...");
  const report = await getReport();
  console.log("Report Summary:");
  console.log(JSON.stringify(report, null, 2));

  // 6. Fetch Failed Reconciliations
  console.log("\n6. Fetching Failures for latest run...");
  const failures = await getFailures();
  console.log("Detailed Failures:");
  console.log(JSON.stringify(failures, null, 2));

  // 7. Verify the expected mismatch types are logged
  console.log("\n7. Validating Mismatch Results...");
  const actualTxTypesMap = new Map<string, string>();
  for (const failure of failures) {
    actualTxTypesMap.set(failure.transactionId, failure.mismatchType);
  }

  const expectedMismatches = [
    { txId: tx2Id, type: "AMOUNT_MISMATCH" },
    { txId: tx3Id, type: "STATUS_MISMATCH" },
    { txId: tx4Id, type: "DUPLICATE_SETTLEMENT" },
    { txId: tx5Id, type: "MISSING_SETTLEMENT" },
  ];

  let success = true;
  for (const expected of expectedMismatches) {
    const actual = actualTxTypesMap.get(expected.txId);
    if (actual === expected.type) {
      console.log(`  ✓ Transaction ID ${expected.txId} correctly flagged as ${expected.type}`);
    } else {
      console.log(`  ✗ Transaction ID ${expected.txId} failed to be flagged as ${expected.type}. Actual: ${actual}`);
      success = false;
    }
  }

  if (success) {
    console.log("\n🎉 ALL RECONCILIATION CHECKS PASSED SUCCESSFULLY!");
  } else {
    console.log("\n❌ SOME RECONCILIATION CHECKS FAILED!");
  }

  console.log("\n=== RECONCILIATION ENGINE VERIFICATION COMPLETE ===");
  await prisma.$disconnect();
  pool.end();
}

run().catch((err) => {
  console.error("Verification failed:", err);
  prisma.$disconnect();
  pool.end();
});
