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

async function runAnalysis(transactionId: string): Promise<any> {
  const res = await fetch(`http://localhost:5000/fraud/analyze/${transactionId}`, {
    method: "POST",
  });
  const json = (await res.json()) as any;
  if (!json.success) {
    throw new Error(`Analysis failed: ${json.message}`);
  }
  return json.data;
}

async function run() {
  console.log("=== STARTING FRAUD DETECTION ENGINE VERIFICATION ===");

  // 1. Create accounts A and B
  console.log("\n1. Creating test accounts...");
  const resA = await fetch("http://localhost:5000/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: `fraud_A_${Date.now()}`, accountType: "SAVINGS", currency: "USD" }),
  });
  const accountAJson = (await resA.json()) as any;
  const accountAId = accountAJson.data.id;

  const resB = await fetch("http://localhost:5000/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: `fraud_B_${Date.now()}`, accountType: "SAVINGS", currency: "USD" }),
  });
  const accountBJson = (await resB.json()) as any;
  const accountBId = accountBJson.data.id;
  console.log(`Account A ID: ${accountAId}`);
  console.log(`Account B ID: ${accountBId}`);

  // 2. Fund Account A with 10,000 USD
  console.log("\n2. Funding Account A with 10,000 USD...");
  const depositTx = await prisma.transaction.create({ data: { reference: `FDEP-${Date.now()}`, status: "SUCCESS" } });
  await prisma.ledgerEntry.create({
    data: { accountId: accountAId, transactionId: depositTx.id, entryType: "CREDIT", amount: 10000, description: "Seed Funding" },
  });
  console.log(`Account A balance: ${await getBalance(accountAId)} USD`);

  // 3. Test Rule 1: Velocity Check
  // Execute 6 quick transfers of 10 USD from A to B
  console.log("\n3. Testing Rule 1: Velocity Check (performing 6 rapid transfers of 10 USD)...");
  let lastTxId = "";
  for (let i = 1; i <= 6; i++) {
    lastTxId = await makeTransfer(accountAId, accountBId, 10);
    console.log(`  Transfer ${i} executed, Tx ID: ${lastTxId}`);
  }
  
  console.log("Analyzing latest transfer for Velocity triggers...");
  const analysis1 = await runAnalysis(lastTxId);
  console.log("Analysis Output (Expected VELOCITY_LIMIT_EXCEEDED, score >= 40, severity: MEDIUM):");
  console.log(JSON.stringify(analysis1, null, 2));

  // 4. Test Rule 2: Repeated Amount Check
  // We already did transfers of 10 USD. Let's do a new set of 3 consecutive transfers of 50 USD
  console.log("\n4. Testing Rule 2: Repeated Amount Pattern (performing 3 consecutive transfers of 50 USD)...");
  await makeTransfer(accountAId, accountBId, 50);
  await makeTransfer(accountAId, accountBId, 50);
  const repeatedTxId = await makeTransfer(accountAId, accountBId, 50);

  console.log("Analyzing latest transfer for Repeated Amount triggers...");
  const analysis2 = await runAnalysis(repeatedTxId);
  console.log("Analysis Output (Expected REPEATED_AMOUNT_PATTERN, score >= 20):");
  console.log(JSON.stringify(analysis2, null, 2));

  // 5. Test Rule 3: Large Transfer Spike
  // Average of A's debits is around: (6 * 10 + 3 * 50) / 9 = 23.33 USD
  // A transfer of 100 USD is > 3x average (70 USD). Let's test it!
  console.log("\n5. Testing Rule 3: Large Transfer Spike (performing a transfer of 150 USD)...");
  const spikeTxId = await makeTransfer(accountAId, accountBId, 150);
  
  console.log("Analyzing spike transfer...");
  const analysis3 = await runAnalysis(spikeTxId);
  console.log("Analysis Output (Expected LARGE_TRANSFER_SPIKE, score >= 30):");
  console.log(JSON.stringify(analysis3, null, 2));

  // 6. Test Rule 4: Circular Transfer
  // Send 10 USD from B back to A (Circular B -> A)
  console.log("\n6. Testing Rule 4: Circular Transfer (Receiver B sending 10 USD back to Sender A)...");
  // Fund B's DB balance if needed (B already has 210 from transfers + 150 = 360, so B has plenty)
  const circularTxId = await makeTransfer(accountBId, accountAId, 10);

  console.log("Analyzing circular transfer...");
  const analysis4 = await runAnalysis(circularTxId);
  console.log("Analysis Output (Expected CIRCULAR_TRANSFER):");
  console.log(JSON.stringify(analysis4, null, 2));

  // 7. Get All Fraud Alerts
  console.log("\n7. Retrieving global fraud alerts list...");
  const resAlerts = await fetch("http://localhost:5000/fraud/alerts");
  const alertsJson = (await resAlerts.json()) as any;
  console.log(`Total alerts in system: ${alertsJson.data.length}`);
  console.log(JSON.stringify(alertsJson.data.slice(0, 3), null, 2)); // show latest 3

  // 8. Get Account A Fraud History
  console.log("\n8. Retrieving Account A fraud history...");
  const resHistory = await fetch(`http://localhost:5000/fraud/${accountAId}/history`);
  const historyJson = (await resHistory.json()) as any;
  console.log(`Total alerts for Account A: ${historyJson.data.length}`);
  console.log(JSON.stringify(historyJson.data, null, 2));

  console.log("\n=== FRAUD DETECTION ENGINE VERIFICATION RUN COMPLETE ===");
  await prisma.$disconnect();
  pool.end();
}

run().catch((err) => {
  console.error("Verification failed:", err);
  prisma.$disconnect();
  pool.end();
});
