export interface FraudAnalysisResult {
  transactionId: string;
  accountId: string;
  riskScore: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  triggeredRules: string[];
}

export interface FraudAlertDTO {
  id: string;
  transactionId: string;
  accountId: string;
  riskScore: number;
  severity: string;
  triggeredRules: string[];
  createdAt: Date;
}
