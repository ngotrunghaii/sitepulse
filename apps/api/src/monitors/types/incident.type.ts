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
