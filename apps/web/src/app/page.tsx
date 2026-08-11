'use client';

import { useState, useEffect } from 'react';
import { monitorsApi, Monitor, CreateMonitorDto, CheckResult } from '@/services/monitorsApi';

export default function Page() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateMonitorDto>({
    name: '',
    url: '',
    intervalSeconds: 60,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [histories, setHistories] = useState<Record<string, CheckResult[]>>({});

  const fetchMonitors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await monitorsApi.getAll();
      setMonitors(data);
      
      const newHistories: Record<string, CheckResult[]> = {};
      await Promise.all(data.map(async (m) => {
        try {
          const checks = await monitorsApi.getChecks(m.id);
          newHistories[m.id] = checks;
        } catch (e) {
          // Ignore
        }
      }));
      setHistories(newHistories);
    } catch (err: any) {
      setError(err.message || 'Failed to load monitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError(null);
      await monitorsApi.create(formData);
      setFormData({ name: '', url: '', intervalSeconds: 60 });
      await fetchMonitors();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create monitor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await monitorsApi.remove(id);
      setMonitors(monitors.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete monitor');
    }
  };

  const handleCheck = async (id: string) => {
    try {
      setCheckingId(id);
      const updatedMonitor = await monitorsApi.check(id);
      setMonitors(monitors.map(m => m.id === id ? updatedMonitor : m));
      
      try {
        const checks = await monitorsApi.getChecks(id);
        setHistories(prev => ({ ...prev, [id]: checks }));
      } catch (e) {
        // Ignore
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi kiểm tra website');
    } finally {
      setCheckingId(null);
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            SitePulse<span style={{ color: '#3b82f6' }}>.</span>
          </h1>
          <div style={{ padding: '0.5rem 1.25rem', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '9999px', fontWeight: 600, fontSize: '0.875rem', border: '1px solid #bfdbfe' }}>
            Bảng giám sát
          </div>
        </header>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Form Section */}
          <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)', height: 'fit-content' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.25rem' }}>Thêm website giám sát</h2>
            
            {formError && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Tên hiển thị</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ví dụ: Website công ty"
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.15s' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Đường dẫn website/API</label>
                <input 
                  type="url" 
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://example.com"
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Tần suất kiểm tra (giây)</label>
                <input 
                  type="number" 
                  min="60"
                  value={formData.intervalSeconds}
                  onChange={(e) => setFormData({...formData, intervalSeconds: parseInt(e.target.value) || 60})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={submitting}
                style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.75rem', 
                  backgroundColor: submitting ? '#93c5fd' : '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.5rem', 
                  fontWeight: 600, 
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {submitting ? 'Đang thêm...' : 'Thêm website'}
              </button>
            </form>
          </section>

          {/* List Section */}
          <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Website đang giám sát</h2>
              <button onClick={fetchMonitors} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem' }}>
                ↻ Làm mới
              </button>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>Đang tải...</div>
            ) : error ? (
              <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '0.5rem' }}>
                {error}
              </div>
            ) : monitors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '0.5rem' }}>
                Chưa có website nào được giám sát. Hãy thêm website đầu tiên.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {monitors.map((monitor) => (
                  <div key={monitor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', transition: 'box-shadow 0.2s' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#0f172a' }}>{monitor.name}</h3>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: monitor.isActive ? '#22c55e' : '#ef4444' 
                        }}></span>
                      </div>
                      <a href={monitor.url} target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>
                        {monitor.url}
                      </a>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        Kiểm tra mỗi {monitor.intervalSeconds} giây • Ngày tạo: {new Date(monitor.createdAt).toLocaleDateString()}
                      </div>

                      {/* Check result info */}
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <div>
                            <strong>Trạng thái: </strong>
                            {monitor.lastStatus === 'up' && <span style={{ color: '#16a34a' }}>Hoạt động</span>}
                            {monitor.lastStatus === 'down' && <span style={{ color: '#dc2626' }}>Gặp lỗi</span>}
                            {(!monitor.lastStatus || monitor.lastStatus === 'unknown') && <span style={{ color: '#64748b' }}>Chưa kiểm tra</span>}
                          </div>
                          {monitor.lastStatusCode !== undefined && (
                            <div>
                              <strong>Mã lỗi: </strong> {monitor.lastStatusCode}
                            </div>
                          )}
                          {monitor.lastResponseTimeMs !== undefined && (
                            <div>
                              <strong>Phản hồi: </strong> {monitor.lastResponseTimeMs}ms
                            </div>
                          )}
                        </div>
                        {monitor.lastCheckedAt && (
                          <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            Kiểm tra gần nhất: {new Date(monitor.lastCheckedAt).toLocaleString()}
                          </div>
                        )}
                        {monitor.lastError && (
                          <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            <strong>Lỗi: </strong> {monitor.lastError}
                          </div>
                        )}
                      </div>

                      {/* History Section */}
                      {histories[monitor.id] && histories[monitor.id].length > 0 && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#475569' }}>Lịch sử kiểm tra gần đây:</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {histories[monitor.id].slice(0, 5).map(check => (
                              <div key={check.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '0.25rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                  <span style={{ color: check.status === 'up' ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                                    {check.status === 'up' ? 'Hoạt động' : 'Gặp lỗi'}
                                  </span>
                                  {check.statusCode && <span style={{ color: '#64748b' }}>Mã: {check.statusCode}</span>}
                                  <span style={{ color: '#64748b' }}>{check.responseTimeMs}ms</span>
                                </div>
                                <span style={{ color: '#94a3b8' }}>
                                  {new Date(check.checkedAt).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleCheck(monitor.id)}
                        disabled={checkingId === monitor.id}
                        style={{ 
                          padding: '0.5rem 1rem', 
                          backgroundColor: checkingId === monitor.id ? '#93c5fd' : '#2563eb', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '0.5rem', 
                          fontWeight: 500, 
                          cursor: checkingId === monitor.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {checkingId === monitor.id ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
                      </button>
                      <button 
                        onClick={() => handleDelete(monitor.id)}
                        style={{ 
                          padding: '0.5rem 1rem', 
                          backgroundColor: '#fee2e2', 
                          color: '#dc2626', 
                          border: 'none', 
                          borderRadius: '0.5rem', 
                          fontWeight: 500, 
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
