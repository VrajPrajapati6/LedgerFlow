import type { Request, Response, NextFunction } from "express";

export const validateTransferInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { fromAccountId, toAccountId, amount } = req.body;

  if (!fromAccountId || typeof fromAccountId !== "string" || fromAccountId.trim() === "") {
    res.status(400).json({
      success: false,
      message: "fromAccountId is required and must be a valid string",
    });
    return;
  }

  if (!toAccountId || typeof toAccountId !== "string" || toAccountId.trim() === "") {
    res.status(400).json({
      success: false,
      message: "toAccountId is required and must be a valid string",
    });
    return;
  }

  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({
      success: false,
      message: "amount must be a positive number greater than 0",
    });
    return;
  }

  if (fromAccountId === toAccountId) {
    res.status(400).json({
      success: false,
      message: "fromAccountId and toAccountId cannot be the same",
    });
    return;
  }

  next();
};
