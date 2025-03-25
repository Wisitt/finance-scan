'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import Layout from '@/app/layout';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  }));
  
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/error';

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {isAuthPage ? (
            children
          ) : (
            <Layout>{children}</Layout>
          )}
          <Toaster position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}