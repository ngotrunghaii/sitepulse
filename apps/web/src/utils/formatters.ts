export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN');
}

export function statusLabel(status?: 'up' | 'down' | 'unknown'): string {
  if (status === 'up') return 'Hoạt động';
  if (status === 'down') return 'Gặp lỗi';
  return 'Chưa kiểm tra';
}

export function statusColor(status?: 'up' | 'down' | 'unknown'): string {
  if (status === 'up') return '#15803d';
  if (status === 'down') return '#b91c1c';
  return '#64748b';
}
