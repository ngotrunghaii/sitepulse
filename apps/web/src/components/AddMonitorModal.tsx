import React from 'react';
import { CreateMonitorDto } from '@/types/monitor';

type AddMonitorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  formData: CreateMonitorDto;
  submitting: boolean;
  formError: string | null;
  formSuccess: boolean;
  onChange: (data: CreateMonitorDto) => void;
  onClearFeedback: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function AddMonitorModal({
  isOpen, onClose, formData, submitting, formError, formSuccess,
  onChange, onClearFeedback, onSubmit,
}: AddMonitorModalProps) {
  if (!isOpen) return null;

  const update = (patch: Partial<CreateMonitorDto>) => {
    onClearFeedback();
    onChange({ ...formData, ...patch });
  };

  return (
    <div className="sp-modal-overlay">
      <div className="sp-modal-container">
        <div className="sp-modal-header">
          <h2 className="sp-card-title">Thêm website giám sát</h2>
          <button className="sp-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="sp-modal-body">
          {formError && (
            <div style={{
              padding: '0.625rem 0.75rem', backgroundColor: 'var(--sp-error-bg)',
              border: '1px solid #fecaca', borderRadius: '6px',
              color: 'var(--sp-error-text)', fontSize: '0.8125rem', marginBottom: '1rem',
            }}>
              {formError}
            </div>
          )}

          {formSuccess && (
            <div style={{
              padding: '0.625rem 0.75rem', backgroundColor: 'var(--sp-success-bg)',
              border: '1px solid #bbf7d0', borderRadius: '6px',
              color: 'var(--sp-success-text)', fontSize: '0.8125rem', marginBottom: '1rem',
            }}>
              Website đã được thêm thành công!
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="sp-label">Tên hiển thị</label>
              <input
                type="text"
                className="sp-input"
                value={formData.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Ví dụ: Website công ty"
                required
              />
            </div>

            <div>
              <label className="sp-label">Đường dẫn URL</label>
              <input
                type="url"
                className="sp-input"
                value={formData.url}
                onChange={(e) => update({ url: e.target.value })}
                placeholder="https://example.com"
                required
              />
              <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: 'var(--sp-text-muted)' }}>
                Ví dụ: https://example.com hoặc https://api.example.com/health
              </p>
            </div>

            <div>
              <label className="sp-label">Tần suất kiểm tra (giây)</label>
              <input
                type="number"
                className="sp-input"
                min={60}
                value={formData.intervalSeconds}
                onChange={(e) => onChange({ ...formData, intervalSeconds: parseInt(e.target.value) || 60 })}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                className="sp-btn sp-btn-outline"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="sp-btn sp-btn-primary"
              >
                {submitting ? 'Đang xử lý…' : 'Thêm website'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
