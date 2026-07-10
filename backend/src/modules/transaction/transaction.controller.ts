import type { Request, Response } from "express";
import { executeTransfer, getTransactions, getTransactionById } from "./transaction.service.js";
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
    console.error("Transfer execution failed:", error);
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

export const getTransactionsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, status, sortBy, sortOrder, limit, offset } = req.query;

    const filters = {
      search: typeof search === "string" ? search : undefined,
      status: typeof status === "string" ? status : undefined,
      sortBy: typeof sortBy === "string" ? sortBy : undefined,
      sortOrder: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    };

    const result = await getTransactions(filters as any);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
};

export const getTransactionByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const tx = await getTransactionById(id);

    if (!tx) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: tx,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction details",
    });
  }
};
