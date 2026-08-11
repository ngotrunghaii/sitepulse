type DashboardHeaderProps = {
  onRefresh: () => void;
  loading: boolean;
};

export default function DashboardHeader({ onRefresh, loading }: DashboardHeaderProps) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
            SitePulse
          </h1>
          <span style={{ color: '#2563eb', fontSize: '1.5rem', fontWeight: 700 }}>.</span>
        </div>
        <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
          Giám sát uptime, thời gian phản hồi và sự cố website
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '0.5rem 1rem', borderRadius: '6px',
          border: '1px solid #e2e8f0', backgroundColor: '#fff',
          color: '#374151', fontSize: '0.8125rem', fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s',
        }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>↻</span>
        Làm mới
      </button>
    </header>
  );
}
