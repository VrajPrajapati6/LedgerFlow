import { Router } from "express";
import {
  analyzeTransactionController,
  getAlertsController,
  getAccountHistoryController,
} from "./fraud.controller.js";

const router = Router();

router.post("/analyze/:transactionId", analyzeTransactionController);
router.get("/alerts", getAlertsController);
router.get("/:accountId/history", getAccountHistoryController);

export default router;
