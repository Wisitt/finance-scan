'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
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
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          forcedTheme={undefined} // ลบ forcedTheme ถ้ามี
          themes={["light", "dark"]} // ให้ใช้เฉพาะธีมที่เรากำหนด
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'text-sm',
              duration: 3000,
              // ทำให้ toast มีสีตามธีม
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </NextThemesProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}