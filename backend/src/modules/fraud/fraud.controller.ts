import type { Request, Response } from "express";
import { analyzeTransaction, getSuspiciousAlerts, getAccountFraudHistory } from "./fraud.service.js";

export const analyzeTransactionController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const transactionId = req.params.transactionId as string;
    if (!transactionId) {
      res.status(400).json({ success: false, message: "transactionId parameter is required" });
      return;
    }

    const analysis = await analyzeTransaction(transactionId);
    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run fraud analysis";
    res.status(message.includes("not found") ? 404 : 400).json({
      success: false,
      message,
    });
  }
};

export const getAlertsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const alerts = await getSuspiciousAlerts();
    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch fraud alerts";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const getAccountHistoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accountId = req.params.accountId as string;
    if (!accountId) {
      res.status(400).json({ success: false, message: "accountId parameter is required" });
      return;
    }

    const history = await getAccountFraudHistory(accountId);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch account fraud history";
    res.status(message.includes("not found") ? 404 : 400).json({
      success: false,
      message,
    });
  }
};
