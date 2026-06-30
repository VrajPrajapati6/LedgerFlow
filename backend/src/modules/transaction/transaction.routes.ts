import { Router } from "express";
import { transferController } from "./transaction.controller.js";
import { validateTransferInput } from "./transaction.validator.js";

const router = Router();

router.post("/transfer", validateTransferInput, transferController);

export default router;
