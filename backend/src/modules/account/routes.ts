import { Router } from "express";
import { createAccountController, getAccountsController, getAccountByIdController } from "./controller.js";

const router = Router();

router.post("/", createAccountController);
router.get("/", getAccountsController);
router.get("/:id", getAccountByIdController);

export default router;
