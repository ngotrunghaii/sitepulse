import { Monitor, CheckResult, Incident } from '@/types/monitor';
import MonitorCard from './MonitorCard';
import EmptyState from './EmptyState';

type MonitorListProps = {
  monitors: Monitor[];
  histories: Record<string, CheckResult[]>;
  openIncidentsByMonitor: Record<string, Incident>;
  loading: boolean;
  error: string | null;
  checkingId: string | null;
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function MonitorList({
  monitors, histories, openIncidentsByMonitor, loading, error, checkingId, onCheck, onDelete,
}: MonitorListProps) {
  return (
    <section style={{
      backgroundColor: '#fff', border: '1px solid #e5e7eb',
      borderRadius: '8px', padding: '1.5rem',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
          Website đang giám sát
          {monitors.length > 0 && (
            <span style={{
              marginLeft: '0.5rem', padding: '1px 8px', borderRadius: '4px',
              backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
              fontSize: '0.75rem', fontWeight: 500, color: '#475569',
            }}>
              {monitors.length}
            </span>
          )}
        </h2>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8', fontSize: '0.875rem' }}>
          Đang tải dữ liệu…
        </div>
      ) : error ? (
        <div style={{
          padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '6px', color: '#b91c1c', fontSize: '0.875rem',
        }}>
          {error}
        </div>
      ) : monitors.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {monitors.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              history={histories[monitor.id] ?? []}
              openIncident={openIncidentsByMonitor[monitor.id]}
              isChecking={checkingId === monitor.id}
              onCheck={() => onCheck(monitor.id)}
              onDelete={() => onDelete(monitor.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
