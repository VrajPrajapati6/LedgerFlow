import type { Request, Response } from "express";
import { createAccountSnapshot, getLatestSnapshot, getOptimizedBalance, getSnapshots } from "./snapshot.service.js";

export const createSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const accountId = req.params.accountId as string;
    if (!accountId) {
      res.status(400).json({ success: false, message: "accountId parameter is required" });
      return;
    }

    const snapshot = await createAccountSnapshot(accountId);
    res.status(201).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create snapshot";
    res.status(message.includes("not found") ? 404 : 400).json({
      success: false,
      message,
    });
  }
};

export const getLatest = async (req: Request, res: Response): Promise<void> => {
  try {
    const accountId = req.params.accountId as string;
    if (!accountId) {
      res.status(400).json({ success: false, message: "accountId parameter is required" });
      return;
    }

    const snapshot = await getLatestSnapshot(accountId);
    res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch latest snapshot";
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

    const balanceData = await getOptimizedBalance(accountId);
    res.status(200).json({
      success: true,
      data: balanceData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch optimized balance";
    res.status(message.includes("not found") ? 404 : 500).json({
      success: false,
      message,
    });
  }
};

export const getSnapshotsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getSnapshots();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch snapshots";
    res.status(500).json({
      success: false,
      message,
    });
  }
};
