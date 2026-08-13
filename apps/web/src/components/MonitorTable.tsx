import React, { useState } from 'react';
import { Monitor, CheckResult, Incident } from '@/types/monitor';
import { formatDateTime } from '@/utils/formatters';
import StatusBadge from './StatusBadge';
import CheckHistoryTable from './CheckHistoryTable';
import EmptyState from './EmptyState';

type MonitorTableProps = {
  monitors: Monitor[];
  histories: Record<string, CheckResult[]>;
  openIncidentsByMonitor: Record<string, Incident>;
  loading: boolean;
  error: string | null;
  checkingId: string | null;
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
  onAlertConfig: (id: string, name: string) => void;
};

export default function MonitorTable({
  monitors, histories, openIncidentsByMonitor, loading, error, checkingId, onCheck, onDelete, onAlertConfig,
}: MonitorTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'up' | 'down'>('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const filteredMonitors = monitors.filter((m) => {
    if (searchTerm && !m.name.toLowerCase().includes(searchTerm.toLowerCase()) && !m.url.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterStatus === 'up' && m.lastStatus !== 'up') return false;
    if (filterStatus === 'down' && m.lastStatus !== 'down') return false;
    return true;
  });

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <section className="sp-card" style={{ padding: 0 }}>
      {/* Toolbar */}
      <div className="sp-table-toolbar">
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="sp-search-input"
            placeholder="Tìm website..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`sp-btn ${filterStatus === 'all' ? 'sp-btn-primary' : 'sp-btn-outline'}`}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            onClick={() => setFilterStatus('all')}
          >
            Tất cả
          </button>
          <button
            className={`sp-btn ${filterStatus === 'up' ? 'sp-btn-primary' : 'sp-btn-outline'}`}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            onClick={() => setFilterStatus('up')}
          >
            Hoạt động
          </button>
          <button
            className={`sp-btn ${filterStatus === 'down' ? 'sp-btn-primary' : 'sp-btn-outline'}`}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            onClick={() => setFilterStatus('down')}
          >
            Gặp lỗi
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="sp-empty-state" style={{ border: 'none' }}>
          Đang tải dữ liệu…
        </div>
      ) : error ? (
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            padding: '1rem', backgroundColor: 'var(--sp-error-bg)',
            border: '1px solid #fecaca', borderRadius: 'var(--sp-radius)',
            color: 'var(--sp-error-text)', fontSize: '0.875rem',
          }}>
            {error}
          </div>
        </div>
      ) : monitors.length === 0 ? (
        <div style={{ padding: '1.5rem' }}>
          <EmptyState />
        </div>
      ) : (
        <div className="sp-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="sp-table">
            <thead>
              <tr>
                <th>Website</th>
                <th>Trạng thái</th>
                <th>HTTP</th>
                <th>Phản hồi</th>
                <th>Kiểm tra gần nhất</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredMonitors.map((monitor) => {
                const isExpanded = expandedRowId === monitor.id;
                const recentChecks = (histories[monitor.id] ?? []).slice(0, 5);
                const hasIncident = !!openIncidentsByMonitor[monitor.id];

                return (
                  <React.Fragment key={monitor.id}>
                    <tr onClick={() => toggleRow(monitor.id)} className={isExpanded ? 'sp-expanded-row' : ''}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--sp-text-primary)' }}>
                          {monitor.name}
                        </div>
                        <a
                          href={monitor.url} target="_blank" rel="noreferrer"
                          style={{ color: 'var(--sp-text-secondary)', textDecoration: 'none', fontSize: '0.75rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {monitor.url}
                        </a>
                      </td>
                      <td>
                        <StatusBadge status={monitor.lastStatus} />
                      </td>
                      <td>
                        {monitor.lastStatusCode ? (
                          <span className="sp-badge sp-badge-neutral">
                            {monitor.lastStatusCode}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        {monitor.lastResponseTimeMs ? `${monitor.lastResponseTimeMs} ms` : '—'}
                      </td>
                      <td style={{ color: 'var(--sp-text-secondary)', fontSize: '0.75rem' }}>
                        {monitor.lastCheckedAt ? formatDateTime(monitor.lastCheckedAt) : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); onCheck(monitor.id); }}
                            disabled={checkingId === monitor.id}
                            className="sp-btn sp-btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            {checkingId === monitor.id ? 'Đang...' : 'Kiểm tra'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onAlertConfig(monitor.id, monitor.name); }}
                            className="sp-btn sp-btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Cảnh báo
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(monitor.id); }}
                            className="sp-btn sp-btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--sp-error)' }}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <tr className="sp-expanded-row">
                        <td colSpan={6} style={{ padding: 0 }}>
                          <div className="sp-expanded-content">
                            
                            {hasIncident && (
                              <div style={{
                                marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '6px',
                                backgroundColor: '#fffbeb', border: '1px solid #fde68a',
                                fontSize: '0.875rem', color: '#92400e',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                              }}>
                                <span>⚠</span>
                                <span>
                                  <strong>Sự cố đang mở</strong> từ {formatDateTime(openIncidentsByMonitor[monitor.id].startedAt)}
                                  {openIncidentsByMonitor[monitor.id].reason ? ` — ${openIncidentsByMonitor[monitor.id].reason}` : ''}
                                </span>
                              </div>
                            )}

                            {monitor.lastError && !hasIncident && (
                              <div style={{
                                marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '6px',
                                backgroundColor: 'var(--sp-error-bg)', border: '1px solid #fecaca',
                                fontSize: '0.875rem', color: 'var(--sp-error-text)',
                              }}>
                                <strong>Lỗi:</strong> {monitor.lastError}
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--sp-text-primary)' }}>
                                Lịch sử 5 lần kiểm tra gần nhất
                              </h4>
                              <span style={{ fontSize: '0.75rem', color: 'var(--sp-text-muted)' }}>
                                Tần suất: {monitor.intervalSeconds}s
                              </span>
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                              <CheckHistoryTable checks={recentChecks} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredMonitors.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--sp-text-muted)' }}>
                    Không tìm thấy website nào khớp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
