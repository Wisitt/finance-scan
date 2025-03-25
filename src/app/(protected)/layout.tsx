// layouts/ProtectedLayout.tsx
'use client';
import { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Header from '@/layouts/Header';
import { MobileNav } from '@/components/MobileNav';

interface ProtectedLayoutProps {
  children: ReactNode;
}

/**
 * Layout for all protected routes that require authentication
 * Includes sidebar navigation and header
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar navigation - visible on desktop only */}
      <aside className="hidden md:block w-64 border-r">
        <Sidebar />
      </aside>
      
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-background flex items-center h-14 border-b px-4">
          {/* Mobile navigation - visible on mobile only */}
          <div className="md:hidden">
            <MobileNav />
          </div>
          
          {/* Header */}
          <Header />
        </div>
        
        <div className="p-4 md:p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
