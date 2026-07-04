import type { Request, Response } from "express";
import {
  createMockSettlement,
  runReconciliation,
  getLatestReport,
  getFailedReconciliations,
} from "./reconciliation.service.js";

export const createMockSettlementController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { transactionId, amount, status, settlementTimestamp } = req.body;

    if (!transactionId || typeof transactionId !== "string") {
      res.status(400).json({
        success: false,
        message: "transactionId is required and must be a string",
      });
      return;
    }

    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({
        success: false,
        message: "amount is required and must be a positive number",
      });
      return;
    }

    if (status !== "SUCCESS" && status !== "FAILED") {
      res.status(400).json({
        success: false,
        message: "status must be either SUCCESS or FAILED",
      });
      return;
    }

    const timestamp = settlementTimestamp ? new Date(settlementTimestamp) : new Date();
    if (isNaN(timestamp.getTime())) {
      res.status(400).json({
        success: false,
        message: "settlementTimestamp must be a valid date string",
      });
      return;
    }

    const settlement = await createMockSettlement({
      transactionId,
      amount,
      status,
      settlementTimestamp: timestamp,
    });

    res.status(201).json({
      success: true,
      data: settlement,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create mock settlement";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const runReconciliationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await runReconciliation();
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run reconciliation";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const getReportController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const report = await getLatestReport();
    if (!report) {
      res.status(404).json({
        success: false,
        message: "No reconciliation report found. Please run reconciliation first.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch report";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const getFailuresController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { latestOnly } = req.query;
    const onlyLatest = latestOnly === undefined ? true : latestOnly === "true";

    const failures = await getFailedReconciliations(onlyLatest);

    res.status(200).json({
      success: true,
      data: failures,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch failures";
    res.status(500).json({
      success: false,
      message,
    });
  }
};
