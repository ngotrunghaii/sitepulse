import { Monitor, CheckResult, Incident, CreateMonitorDto } from '@/types/monitor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const monitorsApi = {
  async getAll(): Promise<Monitor[]> {
    const res = await fetch(`${API_URL}/monitors`);
    return handleResponse<Monitor[]>(res);
  },

  async create(data: CreateMonitorDto): Promise<Monitor> {
    const res = await fetch(`${API_URL}/monitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Monitor>(res);
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/monitors/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Không thể xóa monitor.');
  },

  async check(id: string): Promise<Monitor> {
    const res = await fetch(`${API_URL}/monitors/${id}/check`, { method: 'POST' });
    return handleResponse<Monitor>(res);
  },

  async getChecks(id: string): Promise<CheckResult[]> {
    const res = await fetch(`${API_URL}/monitors/${id}/checks`);
    return handleResponse<CheckResult[]>(res);
  },

  async getIncidents(): Promise<Incident[]> {
    const res = await fetch(`${API_URL}/monitors/incidents`);
    return handleResponse<Incident[]>(res);
  },

  async getMonitorIncidents(id: string): Promise<Incident[]> {
    const res = await fetch(`${API_URL}/monitors/${id}/incidents`);
    return handleResponse<Incident[]>(res);
  },
};
