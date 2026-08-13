import React, { useState, useEffect } from 'react';
import { monitorsApi } from '@/services/monitorsApi';

type AlertSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  monitorId: string;
  monitorName: string;
};

export default function AlertSettingsModal({ isOpen, onClose, monitorId, monitorName }: AlertSettingsModalProps) {
  const [enabled, setEnabled] = useState(true);
  const [email, setEmail] = useState('');
  const [failureThreshold, setFailureThreshold] = useState(1);
  const [notifyOnRecovery, setNotifyOnRecovery] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setError('');
      setSuccess('');
    }
  }, [isOpen, monitorId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await monitorsApi.getAlertRule(monitorId);
      setEnabled(data.enabled ?? true);
      setEmail(data.email || '');
      setFailureThreshold(data.failureThreshold ?? 1);
      setNotifyOnRecovery(data.notifyOnRecovery ?? true);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải cấu hình.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await monitorsApi.updateAlertRule(monitorId, {
        enabled,
        email: email.trim() || null,
        failureThreshold: Number(failureThreshold),
        notifyOnRecovery,
      });
      setSuccess('Lưu cấu hình thành công!');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sp-modal-overlay">
      <div className="sp-modal-content">
        <div className="sp-modal-header">
          <h2>Cấu hình cảnh báo</h2>
          <button onClick={onClose} className="sp-modal-close" type="button">×</button>
        </div>

        <div className="sp-modal-body">
          <p style={{ color: 'var(--sp-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Website: <strong>{monitorName}</strong>
          </p>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--sp-text-secondary)' }}>
              Đang tải...
            </p>
          ) : (
            <form onSubmit={handleSave}>
              <div className="sp-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    style={{ width: '1rem', height: '1rem' }}
                  />
                  <span>Bật cảnh báo</span>
                </label>
              </div>

              <div className="sp-form-group">
                <label>Email nhận cảnh báo (Tùy chọn)</label>
                <input
                  type="email"
                  className="sp-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={!enabled}
                />
              </div>

              <div className="sp-form-group">
                <label>Số lần lỗi liên tiếp (1-10)</label>
                <input
                  type="number"
                  className="sp-input"
                  value={failureThreshold}
                  onChange={(e) => setFailureThreshold(Number(e.target.value))}
                  min={1}
                  max={10}
                  disabled={!enabled}
                />
              </div>

              <div className="sp-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifyOnRecovery}
                    onChange={(e) => setNotifyOnRecovery(e.target.checked)}
                    disabled={!enabled}
                    style={{ width: '1rem', height: '1rem' }}
                  />
                  <span>Thông báo khi khôi phục</span>
                </label>
              </div>

              <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.8125rem', marginTop: '1rem', fontStyle: 'italic' }}>
                * Hiện tại hệ thống chỉ lưu cấu hình cảnh báo. Tích hợp gửi email sẽ được thêm ở bước sau.
              </p>

              {error && <div className="sp-alert sp-alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
              {success && <div className="sp-alert sp-alert-success" style={{ marginTop: '1rem' }}>{success}</div>}

              <div className="sp-modal-footer">
                <button type="button" className="sp-btn sp-btn-secondary" onClick={onClose} disabled={saving}>
                  Đóng
                </button>
                <button type="submit" className="sp-btn sp-btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
