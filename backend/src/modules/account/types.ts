// Account Module Types

export interface CreateAccountDTO {
  userId: string;
  accountType: string;
  currency: string;
}

export interface AccountResponse {
  id: string;
  userId: string;
  accountType: string;
  currency: string;
  status: string;
  createdAt: Date;
}
