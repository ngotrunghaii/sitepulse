export type CheckResult = {
  id: string;
  monitorId: string;
  status: "up" | "down";
  statusCode?: number;
  responseTimeMs: number;
  checkedAt: string;
  error?: string;
};
