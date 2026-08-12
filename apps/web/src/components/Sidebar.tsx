export type TabType = 'overview' | 'monitors' | 'incidents';

type SidebarProps = {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
};

const NAV_ITEMS: { id: TabType; label: string }[] = [
  { id: 'overview',  label: 'Tổng quan' },
  { id: 'monitors',  label: 'Website giám sát' },
  { id: 'incidents', label: 'Sự cố' },
];

export default function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  return (
    <aside className="sp-sidebar">
      {/* Logo */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--sp-border)' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--sp-text-primary)', letterSpacing: '-0.02em' }}>
          Site<span style={{ color: 'var(--sp-primary)' }}>Pulse</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0.75rem 0.75rem' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => onChangeTab(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === id ? 'var(--sp-primary-light)' : 'transparent',
                  color: activeTab === id ? 'var(--sp-primary)' : 'var(--sp-text-secondary)',
                  fontWeight: activeTab === id ? 600 : 400,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s',
                }}
              >
                {/* Simple indicator square */}
                <span style={{
                  width: '6px', height: '6px', borderRadius: '2px', flexShrink: 0,
                  background: activeTab === id ? 'var(--sp-primary)' : 'var(--sp-border)',
                }} />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

