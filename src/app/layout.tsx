import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './components/Provider';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

const themeScript = `
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
`;

export const metadata: Metadata = {
  title: 'FinScan - บันทึกรายรับรายจ่ายและสแกนใบเสร็จ',
  description: 'บันทึกรายรับรายจ่ายและสแกนใบเสร็จอัตโนมัติด้วย OCR',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
