'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from '@/app/layout';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
      },
    },
  }));
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Layout>{children}</Layout> {/* ใช้ Layout ที่นี่ */}
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}