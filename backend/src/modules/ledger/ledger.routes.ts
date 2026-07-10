import { Router } from "express";
import { getHistory, getBalance, getBalanceAt, getLedgerEntriesController } from "./ledger.controller.js";

const router = Router();

router.get("/", getLedgerEntriesController);
router.get("/:accountId/history", getHistory);
router.get("/:accountId/balance", getBalance);
router.get("/:accountId/balance-at", getBalanceAt);

export default router;
