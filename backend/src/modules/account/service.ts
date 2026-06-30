import prisma from "../../config/prisma.js";
import type { CreateAccountDTO, AccountResponse } from "./types.js";

export class AccountService {
  // Placeholder methods for service logic
  static async createAccount(data: CreateAccountDTO): Promise<AccountResponse> {
    throw new Error("Method not implemented.");
  }

  static async getAccountById(id: string): Promise<AccountResponse | null> {
    throw new Error("Method not implemented.");
  }
}
