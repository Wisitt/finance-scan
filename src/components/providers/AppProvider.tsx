'use client';

import { PropsWithChildren } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

/**
 * Global application provider that wraps the app with necessary context providers
 */
export function AppProvider({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'text-sm',
            duration: 3000,
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
} 