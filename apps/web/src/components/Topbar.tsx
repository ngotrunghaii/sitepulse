type User = {
  email: string;
  name?: string | null;
};

type TopbarProps = {
  user: User | null;
  activeTab: string;
  onRefresh: () => void;
  loading: boolean;
  onLogout: () => void;
  onAddClick: () => void;
};

export default function Topbar({ user, activeTab, onRefresh, loading, onLogout, onAddClick }: TopbarProps) {
  const showAddButton = activeTab === 'overview' || activeTab === 'monitors';

  return (
    <header className="sp-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {showAddButton && (
          <button onClick={onAddClick} className="sp-btn sp-btn-primary" style={{ padding: '0.5rem 0.875rem' }}>
            + Thêm website
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {user && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--sp-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundColor: 'var(--sp-primary-light)', color: 'var(--sp-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700,
            }}>
              {(user.name || user.email).charAt(0).toUpperCase()}
            </span>
            <span className="hide-on-mobile" style={{ fontWeight: 500 }}>{user.name || user.email}</span>
          </div>
        )}

        <button onClick={onRefresh} disabled={loading} className="sp-btn sp-btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>
          ↻ <span className="hide-on-mobile">Làm mới</span>
        </button>

        <button onClick={onLogout} className="sp-btn sp-btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem', color: 'var(--sp-error)' }}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

