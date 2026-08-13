'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMonitors } from '@/hooks/useMonitors';
import AppLayout from '@/components/AppLayout';
import { TabType } from '@/components/Sidebar';
import StatsCards from '@/components/StatsCards';
import AddMonitorModal from '@/components/AddMonitorModal';
import MonitorTable from '@/components/MonitorTable';
import IncidentPanel from '@/components/IncidentPanel';
import AlertSettingsModal from '@/components/AlertSettingsModal';
import NotificationLogs from '@/components/notifications/NotificationLogs';

export default function Page() {
  const {
    monitors, histories, incidents, openIncidentsByMonitor, stats,
    loading, error, checkingId,
    formData, submitting, formError, formSuccess,
    fetchAll, setFormData, clearFormFeedback,
    handleSubmit, handleDelete, handleCheck,
  } = useMonitors();

  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [alertModalMonitor, setAlertModalMonitor] = useState<{ id: string; name: string } | null>(null);

  const [user, setUser] = useState<{ email: string; name?: string | null } | null>(null);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token) {
      router.replace('/login');
    } else if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  const openAddModal = () => setIsAddModalOpen(true);

  if (!isClient) return null;

  const hasMonitors = monitors.length > 0;

  return (
    <AppLayout
      user={user}
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      onRefresh={fetchAll}
      loading={loading}
      onLogout={handleLogout}
      onAddClick={openAddModal}
    >
      <AddMonitorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        formData={formData}
        submitting={submitting}
        formError={formError}
        formSuccess={formSuccess}
        onChange={setFormData}
        onClearFeedback={clearFormFeedback}
        onSubmit={handleFormSubmit}
      />

      {alertModalMonitor && (
        <AlertSettingsModal
          isOpen={true}
          onClose={() => setAlertModalMonitor(null)}
          monitorId={alertModalMonitor.id}
          monitorName={alertModalMonitor.name}
        />
      )}

      {/* ── Tổng quan ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <StatsCards stats={stats} />

          {!loading && !hasMonitors ? (
            <div style={{
              padding: '3rem 2rem', textAlign: 'center',
              background: '#fff', border: '1px solid var(--sp-border)', borderRadius: 'var(--sp-radius)',
            }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '1rem', color: 'var(--sp-text-primary)' }}>
                Chưa có website nào được giám sát
              </p>
              <p style={{ margin: '0 0 1.25rem', color: 'var(--sp-text-secondary)', fontSize: '0.875rem' }}>
                Thêm website đầu tiên để bắt đầu theo dõi uptime và thời gian phản hồi.
              </p>
              <button onClick={openAddModal} className="sp-btn sp-btn-primary">
                + Thêm website đầu tiên
              </button>
            </div>
          ) : (
            <>
              <section>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.625rem', color: 'var(--sp-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Website đang giám sát
                </h2>
                <MonitorTable
                  monitors={monitors}
                  histories={histories}
                  openIncidentsByMonitor={openIncidentsByMonitor}
                  loading={loading}
                  error={error}
                  checkingId={checkingId}
                  onCheck={handleCheck}
                  onDelete={handleDelete}
                  onAlertConfig={(id, name) => setAlertModalMonitor({ id, name })}
                />
              </section>

              <section>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.625rem', color: 'var(--sp-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Sự cố gần đây
                </h2>
                <IncidentPanel incidents={incidents} monitors={monitors} />
              </section>

              <section>
                <NotificationLogs />
              </section>
            </>
          )}
        </div>
      )}

      {/* ── Website giám sát ── */}
      {activeTab === 'monitors' && (
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.625rem', color: 'var(--sp-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quản lý website
          </h2>
          <MonitorTable
            monitors={monitors}
            histories={histories}
            openIncidentsByMonitor={openIncidentsByMonitor}
            loading={loading}
            error={error}
            checkingId={checkingId}
            onCheck={handleCheck}
            onDelete={handleDelete}
            onAlertConfig={(id, name) => setAlertModalMonitor({ id, name })}
          />
        </div>
      )}

      {/* ── Sự cố ── */}
      {activeTab === 'incidents' && (
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.625rem', color: 'var(--sp-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quản lý sự cố
          </h2>
          <IncidentPanel incidents={incidents} monitors={monitors} />
        </div>
      )}
    </AppLayout>
  );
}
