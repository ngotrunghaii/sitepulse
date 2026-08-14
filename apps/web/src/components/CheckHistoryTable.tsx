import { CheckResult } from '@/types/monitor';
import { formatDateTime } from '@/utils/formatters';

type CheckHistoryTableProps = {
  checks: CheckResult[];
};

function statusLabel(status: CheckResult['status']): string {
  if (status === 'up') return 'Hoạt động';
  if (status === 'warning') return 'Cảnh báo';
  return 'Gặp lỗi';
}

function statusColor(status: CheckResult['status']): string {
  if (status === 'up') return 'var(--sp-success-text, #065f46)';
  if (status === 'warning') return '#92400e';
  return 'var(--sp-error-text, #b91c1c)';
}

export default function CheckHistoryTable({ checks }: CheckHistoryTableProps) {
  if (checks.length === 0) return null;

  return (
    <div>
      <div style={{
        fontSize: '0.75rem', fontWeight: 600, color: 'var(--sp-text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem',
      }}>
        Lịch sử kiểm tra gần đây
      </div>

      <div className="sp-table-wrapper">
        <table className="sp-table">
          <thead>
            <tr>
              <th>Trạng thái</th>
              <th>Mã HTTP</th>
              <th>Phản hồi</th>
              <th>Số lần thử</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((check) => (
              <tr key={check.id}>
                <td>
                  <span style={{ fontWeight: 600, color: statusColor(check.status) }}>
                    {statusLabel(check.status)}
                  </span>
                  {(check.error || check.errorReason) && (
                    <div style={{
                      color: check.status === 'warning' ? '#92400e' : 'var(--sp-error-text)',
                      fontSize: '0.75rem', marginTop: '0.25rem',
                      maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {check.errorReason || check.error}
                    </div>
                  )}
                </td>
                <td>{check.statusCode ? `HTTP ${check.statusCode}` : '—'}</td>
                <td>{check.responseTimeMs !== null ? `${check.responseTimeMs} ms` : '—'}</td>
                <td>
                  {(check.attemptCount && check.attemptCount > 1)
                    ? <span style={{ color: '#92400e', fontWeight: 600 }}>{check.attemptCount}×</span>
                    : '1×'}
                </td>
                <td style={{ color: 'var(--sp-text-secondary)' }}>
                  {formatDateTime(check.checkedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
