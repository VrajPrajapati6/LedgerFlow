import type { Request, Response } from "express";
import { createAccount, getAccounts, getAccountById } from "./service.js";

export const createAccountController = async (
  req: Request,
  res: Response
) => {
  try {
    const account = await createAccount(req.body);

    res.status(201).json({
      success: true,
      data: account,
    });
  }
  catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create account",
    });
  }
};

export const getAccountsController = async (
  req: Request,
  res: Response
) => {
  try {
    const accounts = await getAccounts();

    res.status(200).json({
      success: true,
      data: accounts,
    });
  }
  catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch accounts",
    });
  }
};

export const getAccountByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const account = await getAccountById(req.params.id as string);

    if (!account) {
      res.status(404).json({
        success: false,
        message: "Account not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  }
  catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch account details",
    });
  }
};
