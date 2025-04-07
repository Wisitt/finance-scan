'use client';

import { ThemeProvider } from '@/contexts/theme-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
      },
    },
  }));

  return (
    <SessionProvider refetchOnWindowFocus={true} refetchInterval={5 * 60}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'text-sm',
              duration: 3000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}