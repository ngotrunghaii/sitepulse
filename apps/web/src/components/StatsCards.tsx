type Stats = {
  total: number;
  up: number;
  down: number;
  avgMs: number | null;
  openIncidents: number;
};

function StatCard({
  label, value, helperText, accent, dotClass
}: {
  label: string;
  value: string | number;
  helperText?: string;
  accent?: string;
  dotClass?: string;
}) {
  return (
    <div className="sp-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', borderTop: `3px solid ${accent ?? 'var(--sp-border)'}` }}>
      <div style={{
        fontSize: '0.75rem', fontWeight: 600, color: 'var(--sp-text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem'
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        {dotClass && <span className={`sp-dot ${dotClass}`}></span>}
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--sp-text-primary)', lineHeight: 1 }}>
          {value}
        </div>
      </div>
      {helperText && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--sp-text-muted)' }}>
          {helperText}
        </div>
      )}
    </div>
  );
}

type StatsCardsProps = { stats: Stats };

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="sp-stats-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    }}>
      <StatCard label="Tổng website" value={stats.total} helperText="Website đang được theo dõi" accent="var(--sp-primary)" />
      <StatCard label="Đang hoạt động" value={stats.up} helperText="Phản hồi ổn định" accent="var(--sp-success)" dotClass="sp-dot-success" />
      <StatCard label="Gặp lỗi" value={stats.down} helperText="Cần kiểm tra" accent={stats.down > 0 ? 'var(--sp-error)' : 'var(--sp-border)'} dotClass={stats.down > 0 ? "sp-dot-error" : undefined} />
      <StatCard label="Phản hồi TB" value={stats.avgMs !== null ? `${stats.avgMs} ms` : '—'} helperText="Trung bình lần kiểm tra gần nhất" accent="var(--sp-primary)" />
      <StatCard
        label="Sự cố đang mở"
        value={stats.openIncidents}
        helperText="Incident chưa xử lý"
        accent={stats.openIncidents > 0 ? 'var(--sp-warning)' : 'var(--sp-border)'}
      />
    </div>
  );
}
