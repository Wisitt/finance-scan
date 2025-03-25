import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProvider } from '@/components/providers/AppProvider';

import '@/styles/layout.css';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'FinTrack - บันทึกรายรับรายจ่ายและสแกนใบเสร็จ',
  description: 'บันทึกรายรับรายจ่ายและสแกนใบเสร็จอัตโนมัติด้วย OCR',
  icons: {
    icon: '/favicon.ico',
  },
};

/**
 * Root layout สำหรับทั้งแอปพลิเคชัน
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
