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
  consecutiveFailures?: number;
  consecutiveSuccesses?: number;
};

export type CreateMonitorDto = {
  name: string;
  url: string;
  intervalSeconds: number;
};

// ─── CheckResult ─────────────────────────────────────────────────────────────

export type CheckResultStatus = 'up' | 'warning' | 'down';

export type CheckResult = {
  id: string;
  monitorId: string;
  status: CheckResultStatus;
  statusCode?: number;
  responseTimeMs: number;
  checkedAt: string;
  error?: string;
  attemptCount?: number;
  errorReason?: string;
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
