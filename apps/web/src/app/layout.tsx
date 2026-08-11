import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SitePulse – Giám sát Uptime',
  description: 'Giám sát uptime, thời gian phản hồi và sự cố website theo thời gian thực.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
