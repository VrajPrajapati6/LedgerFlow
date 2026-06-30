import type { Request, Response } from "express";
import { AccountService } from "./service.js";

export class AccountController {
  // Placeholder controller actions
  static async createAccount(req: Request, res: Response): Promise<void> {
    try {
      res.status(501).json({ message: "Not Implemented" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAccount(req: Request, res: Response): Promise<void> {
    try {
      res.status(501).json({ message: "Not Implemented" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
