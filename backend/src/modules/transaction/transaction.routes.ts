import { Router } from "express";
import { transferController, getTransactionsController, getTransactionByIdController, depositController } from "./transaction.controller.js";
import { validateTransferInput } from "./transaction.validator.js";

const router = Router();

router.post("/transfer", validateTransferInput, transferController);
router.post("/deposit", depositController);
router.get("/", getTransactionsController);
router.get("/:id", getTransactionByIdController);

export default router;
