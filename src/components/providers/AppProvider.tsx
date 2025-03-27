'use client';

import { PropsWithChildren, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="top-right" toastOptions={{ className: 'text-sm', duration: 3000 }} />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
