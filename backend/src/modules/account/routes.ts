import { Router } from "express";
import { AccountController } from "./controller.js";

const router = Router();

router.post("/", AccountController.createAccount);
router.get("/:id", AccountController.getAccount);

export default router;
