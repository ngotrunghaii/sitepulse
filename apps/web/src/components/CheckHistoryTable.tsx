import { CheckResult } from '@/types/monitor';
import { formatDateTime, statusColor } from '@/utils/formatters';

type CheckHistoryTableProps = {
  checks: CheckResult[];
};

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
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((check) => (
              <tr key={check.id}>
                <td>
                  <span style={{ fontWeight: 600, color: statusColor(check.status) }}>
                    {check.status === 'up' ? 'Hoạt động' : 'Gặp lỗi'}
                  </span>
                  {check.error && (
                    <div style={{
                      color: 'var(--sp-error-text)', fontSize: '0.75rem', marginTop: '0.25rem',
                      maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {check.error}
                    </div>
                  )}
                </td>
                <td>{check.statusCode ? `HTTP ${check.statusCode}` : '—'}</td>
                <td>{check.responseTimeMs !== null ? `${check.responseTimeMs} ms` : '—'}</td>
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
