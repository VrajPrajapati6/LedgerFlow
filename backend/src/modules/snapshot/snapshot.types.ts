export interface SnapshotDTO {
  id: string;
  accountId: string;
  balance: number;
  lastEventId: string;
  createdAt: Date;
}

export interface OptimizedBalanceResponse {
  accountId: string;
  balance: number;
  currency: string;
  reconstructedFrom: "SNAPSHOT" | "FULL_REPLAY";
  snapshotId?: string;
  snapshotTimestamp?: Date;
}
