import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '@/styles/layout.css';
import './globals.css';
import Providers from '@/components/providers/AppProvider';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'Fin$ight',
  description: 'บันทึกรายรับรายจ่ายและสแกนใบเสร็จอัตโนมัติด้วย OCR',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
