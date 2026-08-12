import { Incident, Monitor } from '@/types/monitor';
import { formatDateTime } from '@/utils/formatters';

type IncidentPanelProps = {
  incidents: Incident[];
  monitors: Monitor[];
};

function IncidentStatusBadge({ status }: { status: 'open' | 'resolved' }) {
  const isOpen = status === 'open';
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 8px',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.03em',
      backgroundColor: isOpen ? '#fef3c7' : '#f0fdf4',
      color: isOpen ? '#92400e' : '#15803d',
      border: `1px solid ${isOpen ? '#fde68a' : '#bbf7d0'}`,
      whiteSpace: 'nowrap',
    }}>
      {isOpen ? 'Đang mở' : 'Đã giải quyết'}
    </span>
  );
}

export default function IncidentPanel({ incidents, monitors }: IncidentPanelProps) {
  const monitorName = (id: string) =>
    monitors.find((m) => m.id === id)?.name ?? id;

  return (
    <section style={{
      backgroundColor: '#fff', border: '1px solid #e5e7eb',
      borderRadius: '8px', padding: '1.5rem',
      marginTop: '1.5rem',
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
          Sự cố gần đây
          {incidents.length > 0 && (
            <span style={{
              marginLeft: '0.5rem', padding: '1px 8px', borderRadius: '4px',
              backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
              fontSize: '0.75rem', fontWeight: 500, color: '#475569',
            }}>
              {incidents.length}
            </span>
          )}
        </h2>
      </div>

      {incidents.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '2rem 0',
          color: '#94a3b8', fontSize: '0.875rem',
        }}>
          Chưa có sự cố nào. Hệ thống đang hoạt động bình thường.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Website', 'Trạng thái', 'Lý do', 'Bắt đầu', 'Giải quyết'].map((h) => (
                  <th key={h} style={{
                    padding: '0.5rem 0.75rem', textAlign: 'left',
                    fontWeight: 500, color: '#64748b', fontSize: '0.75rem',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc, idx) => (
                <tr key={inc.id} style={{
                  borderBottom: idx < incidents.length - 1 ? '1px solid #f8fafc' : 'none',
                }}>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#0f172a', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {monitorName(inc.monitorId)}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem' }}>
                    <IncidentStatusBadge status={inc.status} />
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#475569', maxWidth: '280px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inc.reason}
                    </span>
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {formatDateTime(inc.startedAt)}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {inc.resolvedAt ? formatDateTime(inc.resolvedAt) : <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
