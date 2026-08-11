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

export type CheckResult = {
  id: string;
  monitorId: string;
  status: "up" | "down";
  statusCode?: number;
  responseTimeMs: number;
  checkedAt: string;
  error?: string;
};

export type CreateMonitorDto = {
  name: string;
  url: string;
  intervalSeconds: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const monitorsApi = {
  async getAll(): Promise<Monitor[]> {
    const res = await fetch(`${API_URL}/monitors`);
    if (!res.ok) {
      throw new Error('Failed to fetch monitors');
    }
    return res.json();
  },

  async create(data: CreateMonitorDto): Promise<Monitor> {
    const res = await fetch(`${API_URL}/monitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to create monitor');
    }
    
    return res.json();
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/monitors/${id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      throw new Error('Failed to delete monitor');
    }
  },

  async check(id: string): Promise<Monitor> {
    const res = await fetch(`${API_URL}/monitors/${id}/check`, {
      method: 'POST',
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to check monitor');
    }
    
    return res.json();
  },

  async getChecks(id: string): Promise<CheckResult[]> {
    const res = await fetch(`${API_URL}/monitors/${id}/checks`);
    if (!res.ok) {
      throw new Error('Failed to fetch check history');
    }
    return res.json();
  }
};
