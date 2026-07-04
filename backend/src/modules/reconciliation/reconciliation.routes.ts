import { Router } from "express";
import {
  createMockSettlementController,
  runReconciliationController,
  getReportController,
  getFailuresController,
} from "./reconciliation.controller.js";

const router = Router();

router.post("/mock-settlement", createMockSettlementController);
router.post("/run", runReconciliationController);
router.get("/report", getReportController);
router.get("/failures", getFailuresController);

export default router;
