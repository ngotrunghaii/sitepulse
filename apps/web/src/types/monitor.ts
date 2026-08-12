// ─── Monitor ────────────────────────────────────────────────────────────────

export type MonitorStatus = 'up' | 'down' | 'unknown';

export type Monitor = {
  id: string;
  name: string;
  url: string;
  intervalSeconds: number;
  isActive: boolean;
  createdAt: string;
  lastStatus?: MonitorStatus;
  lastStatusCode?: number;
  lastResponseTimeMs?: number;
  lastCheckedAt?: string;
  lastError?: string;
};

export type CreateMonitorDto = {
  name: string;
  url: string;
  intervalSeconds: number;
};

// ─── CheckResult ─────────────────────────────────────────────────────────────

export type CheckResult = {
  id: string;
  monitorId: string;
  status: 'up' | 'down';
  statusCode?: number;
  responseTimeMs: number;
  checkedAt: string;
  error?: string;
};

// ─── Incident ─────────────────────────────────────────────────────────────────

export type Incident = {
  id: string;
  monitorId: string;
  status: 'open' | 'resolved';
  startedAt: string;
  resolvedAt?: string;
  reason: string;
  lastStatusCode?: number;
  lastError?: string;
};
