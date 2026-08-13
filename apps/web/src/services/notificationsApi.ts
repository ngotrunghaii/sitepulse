import { getAuthToken } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface NotificationLog {
  id: string;
  monitorId?: string | null;
  incidentId?: string | null;
  type: string;
  recipient: string;
  subject: string;
  status: string;
  errorMessage?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export const notificationsApi = {
  getLogs: async (): Promise<NotificationLog[]> => {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Lỗi khi tải lịch sử thông báo');
    }

    return res.json();
  },
};
