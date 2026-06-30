export interface TransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export interface TransferResult {
  transactionId: string;
  reference: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  createdAt: Date;
}
