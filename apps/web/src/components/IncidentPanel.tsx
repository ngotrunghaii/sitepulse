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
      fontSize: '0.75rem',
      fontWeight: 600,
      backgroundColor: isOpen ? '#fef3c7' : 'var(--sp-success-bg)',
      color: isOpen ? '#92400e' : 'var(--sp-success-text)',
      border: `1px solid ${isOpen ? '#fde68a' : '#a7f3d0'}`,
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
    <section className="sp-card" style={{ padding: 0 }}>
      <div style={{
        padding: '0.875rem 1.25rem',
        borderBottom: incidents.length > 0 ? '1px solid var(--sp-border)' : 'none',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--sp-text-primary)' }}>
          Sự cố
        </span>
        {incidents.length > 0 && (
          <span className="sp-badge sp-badge-neutral">{incidents.length}</span>
        )}
      </div>

      {incidents.length === 0 ? (
        <div style={{ padding: '1.25rem', fontSize: '0.875rem', color: 'var(--sp-text-muted)' }}>
          Chưa có sự cố đang mở.
        </div>
      ) : (
        <div className="sp-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="sp-table">
            <thead>
              <tr>
                <th>Website</th>
                <th>Trạng thái</th>
                <th>Lý do</th>
                <th>Bắt đầu</th>
                <th>Giải quyết</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id}>
                  <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {monitorName(inc.monitorId)}
                  </td>
                  <td>
                    <IncidentStatusBadge status={inc.status} />
                  </td>
                  <td style={{ color: 'var(--sp-text-secondary)', maxWidth: '280px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inc.reason || '—'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--sp-text-secondary)', whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                    {formatDateTime(inc.startedAt)}
                  </td>
                  <td style={{ color: 'var(--sp-text-secondary)', whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                    {inc.resolvedAt ? formatDateTime(inc.resolvedAt) : '—'}
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
