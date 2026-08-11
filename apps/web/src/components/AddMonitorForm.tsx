import { CreateMonitorDto } from '@/types/monitor';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.5625rem 0.75rem', borderRadius: '6px',
  border: '1px solid #d1d5db', fontSize: '0.875rem', color: '#0f172a',
  backgroundColor: '#fff', transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8125rem', fontWeight: 500,
  color: '#374151', marginBottom: '0.375rem',
};

type AddMonitorFormProps = {
  formData: CreateMonitorDto;
  submitting: boolean;
  formError: string | null;
  formSuccess: boolean;
  onChange: (data: CreateMonitorDto) => void;
  onClearFeedback: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function AddMonitorForm({
  formData, submitting, formError, formSuccess,
  onChange, onClearFeedback, onSubmit,
}: AddMonitorFormProps) {
  const update = (patch: Partial<CreateMonitorDto>) => {
    onClearFeedback();
    onChange({ ...formData, ...patch });
  };

  return (
    <aside style={{
      backgroundColor: '#fff', border: '1px solid #e5e7eb',
      borderRadius: '8px', padding: '1.5rem',
    }}>
      <h2 style={{ margin: '0 0 1.25rem', fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
        Thêm website giám sát
      </h2>

      {formError && (
        <div style={{
          padding: '0.625rem 0.75rem', backgroundColor: '#fef2f2',
          border: '1px solid #fecaca', borderRadius: '6px',
          color: '#b91c1c', fontSize: '0.8125rem', marginBottom: '1rem',
        }}>
          {formError}
        </div>
      )}

      {formSuccess && (
        <div style={{
          padding: '0.625rem 0.75rem', backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0', borderRadius: '6px',
          color: '#15803d', fontSize: '0.8125rem', marginBottom: '1rem',
        }}>
          Website đã được thêm thành công!
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Tên hiển thị</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Ví dụ: Website công ty"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Đường dẫn URL</label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => update({ url: e.target.value })}
            placeholder="https://example.com"
            required
            style={inputStyle}
          />
          <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Ví dụ: https://example.com hoặc https://api.example.com/health
          </p>
        </div>

        <div>
          <label style={labelStyle}>Tần suất kiểm tra (giây)</label>
          <input
            type="number"
            min={60}
            value={formData.intervalSeconds}
            onChange={(e) => onChange({ ...formData, intervalSeconds: parseInt(e.target.value) || 60 })}
            required
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: '0.25rem', padding: '0.625rem 1rem',
            backgroundColor: submitting ? '#93c5fd' : '#2563eb',
            color: '#fff', border: 'none', borderRadius: '6px',
            fontWeight: 600, fontSize: '0.875rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s',
          }}
        >
          {submitting ? 'Đang thêm…' : 'Thêm website'}
        </button>
      </form>
    </aside>
  );
}
