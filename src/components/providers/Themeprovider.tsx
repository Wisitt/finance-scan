import { ReactNode } from 'react';
import { Inter } from 'next/font/google';

// Choose the font
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <div className={`${inter.variable} font-sans`}>
      {children}
    </div>
  );
}