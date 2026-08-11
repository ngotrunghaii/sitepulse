export default function EmptyState() {
  return (
    <div style={{
      padding: '2.5rem 1.5rem',
      borderLeft: '3px solid #e2e8f0',
      marginLeft: '0.25rem',
    }}>
      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#374151', marginBottom: '0.375rem' }}>
        Chưa có website nào được giám sát
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6 }}>
        Thêm website đầu tiên để bắt đầu theo dõi uptime và thời gian phản hồi.
      </div>
    </div>
  );
}
