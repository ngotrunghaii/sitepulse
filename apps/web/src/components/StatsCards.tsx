type Stats = {
  total: number;
  up: number;
  down: number;
  avgMs: number | null;
};

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{
      backgroundColor: '#fff', border: '1px solid #e5e7eb',
      borderRadius: '8px', padding: '1.25rem 1.5rem',
    }}>
      <div style={{
        fontSize: '0.75rem', fontWeight: 500, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: accent ?? '#0f172a', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

type StatsCardsProps = { stats: Stats };

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="sp-stats-grid" style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem', marginBottom: '1.75rem',
    }}>
      <StatCard label="Tổng website" value={stats.total} />
      <StatCard label="Đang hoạt động" value={stats.up} accent="#15803d" />
      <StatCard label="Gặp lỗi" value={stats.down} accent={stats.down > 0 ? '#dc2626' : '#0f172a'} />
      <StatCard label="Phản hồi TB" value={stats.avgMs !== null ? `${stats.avgMs} ms` : '—'} />
    </div>
  );
}
