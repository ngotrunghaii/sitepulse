'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Monitor, CheckResult, CreateMonitorDto } from '@/types/monitor';
import { monitorsApi } from '@/services/monitorsApi';

export type UseMonitorsReturn = {
  // Data
  monitors: Monitor[];
  histories: Record<string, CheckResult[]>;
  stats: { total: number; up: number; down: number; avgMs: number | null };
  // Loading / error states
  loading: boolean;
  error: string | null;
  checkingId: string | null;
  // Form state
  formData: CreateMonitorDto;
  submitting: boolean;
  formError: string | null;
  formSuccess: boolean;
  // Actions
  fetchAll: () => Promise<void>;
  setFormData: (data: CreateMonitorDto) => void;
  clearFormFeedback: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleCheck: (id: string) => Promise<void>;
};

const EMPTY_FORM: CreateMonitorDto = { name: '', url: '', intervalSeconds: 60 };

export function useMonitors(): UseMonitorsReturn {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [histories, setHistories] = useState<Record<string, CheckResult[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateMonitorDto>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const stats = useMemo(() => {
    const up = monitors.filter((m) => m.lastStatus === 'up').length;
    const down = monitors.filter((m) => m.lastStatus === 'down').length;
    const checked = monitors.filter((m) => m.lastResponseTimeMs !== undefined);
    const avgMs = checked.length
      ? Math.round(checked.reduce((s, m) => s + (m.lastResponseTimeMs ?? 0), 0) / checked.length)
      : null;
    return { total: monitors.length, up, down, avgMs };
  }, [monitors]);

  const fetchHistories = useCallback(async (data: Monitor[]) => {
    const result: Record<string, CheckResult[]> = {};
    await Promise.all(
      data.map(async (m) => {
        try {
          result[m.id] = await monitorsApi.getChecks(m.id);
        } catch { /* ignore */ }
      })
    );
    setHistories(result);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await monitorsApi.getAll();
      setMonitors(data);
      await fetchHistories(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách website.');
    } finally {
      setLoading(false);
    }
  }, [fetchHistories]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const clearFormFeedback = useCallback(() => {
    setFormError(null);
    setFormSuccess(false);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError(null);
      setFormSuccess(false);
      await monitorsApi.create(formData);
      setFormData(EMPTY_FORM);
      setFormSuccess(true);
      await fetchAll();
    } catch (err: any) {
      setFormError(err.message || 'Không thể thêm website.');
    } finally {
      setSubmitting(false);
    }
  }, [formData, fetchAll]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa website này không?')) return;
    try {
      await monitorsApi.remove(id);
      setMonitors((prev) => prev.filter((m) => m.id !== id));
      setHistories((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err: any) {
      alert(err.message || 'Không thể xóa website.');
    }
  }, []);

  const handleCheck = useCallback(async (id: string) => {
    try {
      setCheckingId(id);
      const updated = await monitorsApi.check(id);
      setMonitors((prev) => prev.map((m) => (m.id === id ? updated : m)));
      try {
        const checks = await monitorsApi.getChecks(id);
        setHistories((prev) => ({ ...prev, [id]: checks }));
      } catch { /* ignore */ }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi kiểm tra website.');
    } finally {
      setCheckingId(null);
    }
  }, []);

  return {
    monitors, histories, stats,
    loading, error, checkingId,
    formData, submitting, formError, formSuccess,
    fetchAll, setFormData, clearFormFeedback,
    handleSubmit, handleDelete, handleCheck,
  };
}
