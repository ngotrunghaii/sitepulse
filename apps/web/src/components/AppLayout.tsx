import React from 'react';
import Sidebar, { TabType } from './Sidebar';
import Topbar from './Topbar';

type User = {
  email: string;
  name?: string | null;
};

type AppLayoutProps = {
  children: React.ReactNode;
  user: User | null;
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onRefresh: () => void;
  loading: boolean;
  onLogout: () => void;
  onAddClick: () => void;
};

export default function AppLayout({
  children, user, activeTab, onChangeTab, onRefresh, loading, onLogout, onAddClick
}: AppLayoutProps) {
  return (
    <div className="sp-app-shell">
      <Sidebar activeTab={activeTab} onChangeTab={onChangeTab} />
      
      <div className="sp-main-content">
        <Topbar
          user={user}
          activeTab={activeTab}
          onRefresh={onRefresh}
          loading={loading}
          onLogout={onLogout}
          onAddClick={onAddClick}
        />
        <main className="sp-page-container">
          {children}
        </main>
      </div>
    </div>
  );
}

