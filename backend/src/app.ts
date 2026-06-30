import express from "express";
import accountRoutes from "./modules/account/routes.js";
import transactionRoutes from "./modules/transaction/transaction.routes.js";

const app = express();

app.use(express.json());

app.use("/accounts", accountRoutes);
app.use("/transactions", transactionRoutes);

export default app;
