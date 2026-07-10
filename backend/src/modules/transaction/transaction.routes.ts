import { Router } from "express";
import { transferController, getTransactionsController, getTransactionByIdController } from "./transaction.controller.js";
import { validateTransferInput } from "./transaction.validator.js";

const router = Router();

router.post("/transfer", validateTransferInput, transferController);
router.get("/", getTransactionsController);
router.get("/:id", getTransactionByIdController);

export default router;
