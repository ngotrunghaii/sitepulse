import { Monitor, CheckResult } from '@/types/monitor';
import { formatDate, formatDateTime } from '@/utils/formatters';
import StatusBadge from './StatusBadge';
import CheckHistoryTable from './CheckHistoryTable';

type MonitorCardProps = {
  monitor: Monitor;
  history: CheckResult[];
  isChecking: boolean;
  onCheck: () => void;
  onDelete: () => void;
};

export default function MonitorCard({
  monitor, history, isChecking, onCheck, onDelete,
}: MonitorCardProps) {
  const recent = history.slice(0, 3);

  return (
    <div style={{
      backgroundColor: '#fff', border: '1px solid #e5e7eb',
      borderRadius: '8px', padding: '1.25rem 1.5rem',
      transition: 'box-shadow 0.15s',
    }}>
      {/* ── Top row: identity + actions ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
      }}>
        {/* Left */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.25rem',
          }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
              {monitor.name}
            </h3>
            <StatusBadge status={monitor.lastStatus} />
          </div>
          <a
            href={monitor.url} target="_blank" rel="noreferrer"
            style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.8125rem', wordBreak: 'break-all' }}
          >
            {monitor.url}
          </a>
          <div style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            Kiểm tra mỗi {monitor.intervalSeconds}s &nbsp;•&nbsp; Ngày tạo: {formatDate(monitor.createdAt)}
          </div>
        </div>

        {/* Right: meta chips + buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {monitor.lastStatusCode !== undefined && (
              <span style={{
                fontSize: '0.75rem', color: '#475569',
                backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
                borderRadius: '4px', padding: '2px 8px',
              }}>
                HTTP {monitor.lastStatusCode}
              </span>
            )}
            {monitor.lastResponseTimeMs !== undefined && (
              <span style={{
                fontSize: '0.75rem', color: '#475569',
                backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
                borderRadius: '4px', padding: '2px 8px',
              }}>
                {monitor.lastResponseTimeMs} ms
              </span>
            )}
          </div>

          {monitor.lastCheckedAt && (
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
              Kiểm tra gần nhất: {formatDateTime(monitor.lastCheckedAt)}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              onClick={onCheck}
              disabled={isChecking}
              style={{
                padding: '0.4375rem 0.875rem',
                backgroundColor: isChecking ? '#93c5fd' : '#2563eb',
                color: '#fff', border: 'none', borderRadius: '6px',
                fontWeight: 500, fontSize: '0.8125rem',
                cursor: isChecking ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {isChecking ? 'Đang kiểm tra…' : 'Kiểm tra ngay'}
            </button>
            <button
              onClick={onDelete}
              style={{
                padding: '0.4375rem 0.875rem',
                backgroundColor: '#fff', color: '#dc2626',
                border: '1px solid #fca5a5', borderRadius: '6px',
                fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {monitor.lastError && (
        <div style={{
          marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '6px',
          backgroundColor: '#fef2f2', border: '1px solid #fecaca',
          fontSize: '0.8125rem', color: '#b91c1c',
        }}>
          <strong>Lỗi:</strong> {monitor.lastError}
        </div>
      )}

      {/* ── History ── */}
      <CheckHistoryTable checks={recent} />
    </div>
  );
}
