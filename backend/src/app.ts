import express from "express";
import accountRoutes from "./modules/account/routes.js";
import transactionRoutes from "./modules/transaction/transaction.routes.js";
import ledgerRoutes from "./modules/ledger/ledger.routes.js";
import snapshotRoutes from "./modules/snapshot/snapshot.routes.js";
import fraudRoutes from "./modules/fraud/fraud.routes.js";
import reconciliationRoutes from "./modules/reconciliation/reconciliation.routes.js";

const app = express();

app.use(express.json());

app.use("/accounts", accountRoutes);
app.use("/transactions", transactionRoutes);
app.use("/ledger", ledgerRoutes);
app.use("/snapshots", snapshotRoutes);
app.use("/fraud", fraudRoutes);
app.use("/reconciliation", reconciliationRoutes);

export default app;
