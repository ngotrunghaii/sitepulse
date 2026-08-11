import { MonitorStatus } from '@/types/monitor';

type StatusBadgeProps = {
  status?: MonitorStatus;
};

const configs = {
  up: {
    bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', dot: '#16a34a', label: 'Hoạt động',
  },
  down: {
    bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', dot: '#dc2626', label: 'Gặp lỗi',
  },
  unknown: {
    bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', dot: '#94a3b8', label: 'Chưa kiểm tra',
  },
} as const;

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = configs[status ?? 'unknown'];

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '2px 10px', borderRadius: '4px', fontSize: '0.75rem',
      fontWeight: 600, backgroundColor: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}
