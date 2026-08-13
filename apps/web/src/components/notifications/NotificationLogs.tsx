import React, { useEffect, useState } from 'react';
import { notificationsApi, NotificationLog } from '@/services/notificationsApi';

interface Props {
  refreshTrigger?: number;
}

export default function NotificationLogs({ refreshTrigger }: Props) {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await notificationsApi.getLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'sent':
        return <span style={{ color: 'var(--sp-success, #10b981)', fontWeight: 500 }}>Đã gửi</span>;
      case 'skipped':
        return <span style={{ color: 'var(--sp-warning, #f59e0b)', fontWeight: 500 }}>Chưa cấu hình SMTP</span>;
      case 'failed':
        return <span style={{ color: 'var(--sp-danger, #ef4444)', fontWeight: 500 }}>Gửi lỗi</span>;
      default:
        return <span style={{ color: 'var(--sp-text-secondary, #6b7280)', fontWeight: 500 }}>{status}</span>;
    }
  };

  const renderType = (type: string) => {
    switch (type) {
      case 'incident_opened':
        return 'Sự cố (Mới)';
      case 'incident_resolved':
        return 'Sự cố (Đã khắc phục)';
      default:
        return type;
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div style={{ padding: '1.5rem', background: '#fff', border: '1px solid var(--sp-border)', borderRadius: 'var(--sp-radius)', opacity: 0.7 }}>
        <div style={{ height: '24px', width: '200px', background: 'var(--sp-bg-secondary)', marginBottom: '1rem', borderRadius: '4px' }}></div>
        <div style={{ height: '80px', width: '100%', background: 'var(--sp-bg-secondary)', borderRadius: '4px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid var(--sp-border)', borderRadius: 'var(--sp-radius)', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--sp-text-primary)', margin: '0 0 1rem' }}>Thông báo gần đây</h2>
      {error && <p style={{ color: 'var(--sp-danger)', marginBottom: '1rem' }}>{error}</p>}
      
      {logs.length === 0 && !error ? (
        <p style={{ color: 'var(--sp-text-secondary)' }}>Chưa có thông báo nào.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="sp-table">
            <thead>
              <tr>
                <th>Loại</th>
                <th>Người nhận</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{renderType(log.type)}</td>
                  <td>{log.recipient}</td>
                  <td>{renderStatus(log.status)}</td>
                  <td>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
