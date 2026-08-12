import { Monitor, CheckResult, Incident, CreateMonitorDto } from '@/types/monitor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || res.statusText);
  }
  
  if (res.status === 204) {
    return undefined as unknown as T;
  }
  
  return res.json();
}

export const monitorsApi = {
  async getAll(): Promise<Monitor[]> {
    const res = await fetch(`${API_URL}/monitors`, { headers: getAuthHeaders() });
    return handleResponse<Monitor[]>(res);
  },

  async create(data: CreateMonitorDto): Promise<Monitor> {
    const res = await fetch(`${API_URL}/monitors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Monitor>(res);
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/monitors/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không thể xóa monitor.');
  },

  async check(id: string): Promise<Monitor> {
    const res = await fetch(`${API_URL}/monitors/${id}/check`, { 
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<Monitor>(res);
  },

  async getChecks(id: string): Promise<CheckResult[]> {
    const res = await fetch(`${API_URL}/monitors/${id}/checks`, { headers: getAuthHeaders() });
    return handleResponse<CheckResult[]>(res);
  },

  async getIncidents(): Promise<Incident[]> {
    const res = await fetch(`${API_URL}/monitors/incidents`, { headers: getAuthHeaders() });
    return handleResponse<Incident[]>(res);
  },

  async getMonitorIncidents(id: string): Promise<Incident[]> {
    const res = await fetch(`${API_URL}/monitors/${id}/incidents`, { headers: getAuthHeaders() });
    return handleResponse<Incident[]>(res);
  },
};
