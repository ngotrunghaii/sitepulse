export type Monitor = {
  id: string;
  name: string;
  url: string;
  intervalSeconds: number;
  isActive: boolean;
  createdAt: string;
  lastStatus?: "up" | "down" | "unknown";
  lastStatusCode?: number;
  lastResponseTimeMs?: number;
  lastCheckedAt?: string;
  lastError?: string;
};
