// layouts/ProtectedLayout.tsx
'use client';
import { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Header from '@/layouts/Header';
import { MobileNav } from '@/components/MobileNav';
import { ThemeToggle } from '@/components/theme/mode-toggle';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:block w-64 border-r bg-card/50">
        <Sidebar />
      </aside>
      
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md flex items-center h-16 border-b px-4 shadow-sm">
          <div className="md:hidden flex items-center gap-3">
            <MobileNav />
            <span className="font-medium">FinanceTrack</span>
            
            <div className="absolute right-4">
              <ThemeToggle  />
            </div>
          </div>
          <div className="hidden md:flex w-full items-center justify-between">
            <h1 className="text-lg font-semibold">FinanceTrack</h1>
            <Header />
          </div>
        </div>
        {/* Main content */}
        <div className="p-4 md:p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
