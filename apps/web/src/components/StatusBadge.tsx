import { MonitorStatus } from '@/types/monitor';

type StatusBadgeProps = {
  status?: MonitorStatus;
};

const configs = {
  up: {
    badgeClass: 'sp-badge-success', dotClass: 'sp-dot-success', label: 'Hoạt động',
  },
  down: {
    badgeClass: 'sp-badge-error', dotClass: 'sp-dot-error', label: 'Gặp lỗi',
  },
  unknown: {
    badgeClass: 'sp-badge-neutral', dotClass: '', label: 'Chưa kiểm tra',
  },
} as const;

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = configs[status ?? 'unknown'];

  return (
    <span className={`sp-badge ${cfg.badgeClass}`} style={{ gap: '0.375rem', padding: '0.25rem 0.625rem' }}>
      {cfg.dotClass && <span className={`sp-dot ${cfg.dotClass}`} style={{ width: 6, height: 6 }} />}
      {cfg.label}
    </span>
  );
}
