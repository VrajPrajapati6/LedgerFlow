import { Router } from "express";
import { createSnapshot, getLatest, getBalance } from "./snapshot.controller.js";

const router = Router();

router.post("/:accountId/create", createSnapshot);
router.get("/:accountId/latest", getLatest);
router.get("/:accountId/balance", getBalance);

export default router;
