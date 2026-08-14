export type CheckResult = {
  id: string;
  monitorId: string;
  status: "up" | "warning" | "down";
  statusCode?: number;
  responseTimeMs: number;
  checkedAt: string;
  error?: string;
  attemptCount?: number;
  errorReason?: string;
};
