'use client';

import { useMonitors } from '@/hooks/useMonitors';
import DashboardHeader from '@/components/DashboardHeader';
import StatsCards from '@/components/StatsCards';
import AddMonitorForm from '@/components/AddMonitorForm';
import MonitorList from '@/components/MonitorList';
import IncidentPanel from '@/components/IncidentPanel';

export default function Page() {
  const {
    monitors, histories, incidents, openIncidentsByMonitor, stats,
    loading, error, checkingId,
    formData, submitting, formError, formSuccess,
    fetchAll, setFormData, clearFormFeedback,
    handleSubmit, handleDelete, handleCheck,
  } = useMonitors();

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '1.5rem 1.5rem 3rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        <DashboardHeader onRefresh={fetchAll} loading={loading} />

        <StatsCards stats={stats} />

        <div className="sp-main-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}>
          <AddMonitorForm
            formData={formData}
            submitting={submitting}
            formError={formError}
            formSuccess={formSuccess}
            onChange={setFormData}
            onClearFeedback={clearFormFeedback}
            onSubmit={handleSubmit}
          />

          <div>
            <MonitorList
              monitors={monitors}
              histories={histories}
              openIncidentsByMonitor={openIncidentsByMonitor}
              loading={loading}
              error={error}
              checkingId={checkingId}
              onCheck={handleCheck}
              onDelete={handleDelete}
            />

            <IncidentPanel incidents={incidents} monitors={monitors} />
          </div>
        </div>

      </div>
    </main>
  );
}
