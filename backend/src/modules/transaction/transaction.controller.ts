import type { Request, Response } from "express";
import { executeTransfer } from "./transaction.service.js";
import type { TransferInput } from "./transaction.types.js";

export const transferController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const input: TransferInput = req.body;
    const result = await executeTransfer(input);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";

    // Handle business validation failures with 400 Bad Request
    if (message.includes("not found") || message.includes("Insufficient funds")) {
      res.status(400).json({
        success: false,
        message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Transfer failed",
    });
  }
};
