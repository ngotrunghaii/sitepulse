import { CheckResult } from '@/types/monitor';
import { formatDateTime, statusColor } from '@/utils/formatters';

type CheckHistoryTableProps = {
  checks: CheckResult[];
};

export default function CheckHistoryTable({ checks }: CheckHistoryTableProps) {
  if (checks.length === 0) return null;

  return (
    <div style={{ marginTop: '0.875rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
      <div style={{
        fontSize: '0.75rem', fontWeight: 600, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem',
      }}>
        Lịch sử kiểm tra gần đây
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {checks.map((check) => (
          <div
            key={check.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.375rem 0.625rem', borderRadius: '5px',
              backgroundColor: '#f8fafc', border: '1px solid #e5e7eb',
              fontSize: '0.75rem', gap: '0.75rem', flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: statusColor(check.status) }}>
                {check.status === 'up' ? 'Hoạt động' : 'Gặp lỗi'}
              </span>
              {check.statusCode && (
                <span style={{ color: '#64748b' }}>HTTP {check.statusCode}</span>
              )}
              <span style={{ color: '#64748b' }}>{check.responseTimeMs} ms</span>
              {check.error && (
                <span style={{
                  color: '#b91c1c', maxWidth: 200,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {check.error}
                </span>
              )}
            </div>
            <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
              {formatDateTime(check.checkedAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
