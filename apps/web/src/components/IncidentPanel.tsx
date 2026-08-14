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

function IncidentRow({ inc, monitorName }: { inc: Incident; monitorName: string }) {
  return (
    <tr>
      <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
        {monitorName}
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
  );
}

const RESOLVED_LIMIT = 5;

export default function IncidentPanel({ incidents, monitors }: IncidentPanelProps) {
  const monitorName = (id: string) =>
    monitors.find((m) => m.id === id)?.name ?? id;

  // Sort: open incidents first, then resolved; each group sorted newest first
  const openIncidents = incidents.filter((i) => i.status === 'open')
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved')
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, RESOLVED_LIMIT);

  const displayedIncidents = [...openIncidents, ...resolvedIncidents];

  const hasOpen = openIncidents.length > 0;
  const openCount = openIncidents.length;

  return (
    <section className="sp-card" style={{ padding: 0 }}>
      <div style={{
        padding: '0.875rem 1.25rem',
        borderBottom: displayedIncidents.length > 0 ? '1px solid var(--sp-border)' : 'none',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--sp-text-primary)' }}>
          Sự cố
        </span>
        {hasOpen && (
          <span
            className="sp-badge"
            style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              fontSize: '0.7rem',
              padding: '1px 7px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            {openCount} đang mở
          </span>
        )}
        {!hasOpen && incidents.length > 0 && (
          <span className="sp-badge sp-badge-neutral">{incidents.length}</span>
        )}
      </div>

      {displayedIncidents.length === 0 ? (
        <div style={{ padding: '1.25rem', fontSize: '0.875rem', color: 'var(--sp-text-muted)' }}>
          Chưa có sự cố đang mở.
        </div>
      ) : (
        <>
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
                {displayedIncidents.map((inc) => (
                  <IncidentRow key={inc.id} inc={inc} monitorName={monitorName(inc.monitorId)} />
                ))}
              </tbody>
            </table>
          </div>
          {resolvedIncidents.length >= RESOLVED_LIMIT && (
            <div style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.75rem',
              color: 'var(--sp-text-muted)',
              borderTop: '1px solid var(--sp-border)',
            }}>
              Hiển thị {RESOLVED_LIMIT} sự cố đã giải quyết gần nhất.
            </div>
          )}
        </>
      )}
    </section>
  );
}
