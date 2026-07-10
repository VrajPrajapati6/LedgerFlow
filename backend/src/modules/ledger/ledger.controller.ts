import type { Request, Response } from "express";
import { getAccountHistory, getCurrentBalance, getBalanceAtTimestamp, getLedgerEntries } from "./ledger.service.js";

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const accountId = req.params.accountId as string;
    if (!accountId) {
      res.status(400).json({ success: false, message: "accountId parameter is required" });
      return;
    }

    const history = await getAccountHistory(accountId);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch ledger history";
    res.status(message.includes("not found") ? 404 : 500).json({
      success: false,
      message,
    });
  }
};

export const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const accountId = req.params.accountId as string;
    if (!accountId) {
      res.status(400).json({ success: false, message: "accountId parameter is required" });
      return;
    }

    const balanceData = await getCurrentBalance(accountId);
    res.status(200).json({
      success: true,
      data: balanceData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch current balance";
    res.status(message.includes("not found") ? 404 : 500).json({
      success: false,
      message,
    });
  }
};

export const getBalanceAt = async (req: Request, res: Response): Promise<void> => {
  try {
    const accountId = req.params.accountId as string;
    const { timestamp } = req.query;

    if (!accountId) {
      res.status(400).json({ success: false, message: "accountId parameter is required" });
      return;
    }

    if (!timestamp || typeof timestamp !== "string") {
      res.status(400).json({
        success: false,
        message: "timestamp query parameter is required and must be a valid string",
      });
      return;
    }

    const parsedDate = new Date(timestamp);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({
        success: false,
        message: "Invalid timestamp format. Please provide a valid ISO-8601 date string",
      });
      return;
    }

    const balanceAtData = await getBalanceAtTimestamp(accountId, parsedDate);
    res.status(200).json({
      success: true,
      data: balanceAtData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch point-in-time balance";
    res.status(message.includes("not found") ? 404 : 500).json({
      success: false,
      message,
    });
  }
};

export const getLedgerEntriesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId, transactionId, entryType, startDate, endDate, limit, offset } = req.query;

    const filters = {
      accountId: typeof accountId === "string" ? accountId : undefined,
      transactionId: typeof transactionId === "string" ? transactionId : undefined,
      entryType: entryType === "DEBIT" || entryType === "CREDIT" ? entryType : undefined,
      startDate: typeof startDate === "string" ? new Date(startDate) : undefined,
      endDate: typeof endDate === "string" ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    };

    const result = await getLedgerEntries(filters as any);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch ledger entries";
    res.status(500).json({
      success: false,
      message,
    });
  }
};
