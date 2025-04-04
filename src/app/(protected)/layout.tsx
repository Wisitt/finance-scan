'use client';
import { ReactNode, useState } from 'react';
import Header from '@/components/layouts/Header';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Sidebar } from '@/components/Sidebar';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuClick = () => {
    setMobileOpen(true);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={cn(
          'flex flex-col w-full transition-all duration-300',
          !isMobile && (collapsed ? 'ml-[78px]' : 'ml-64')
        )}
      >
        <Header isMobile={isMobile} onMenuClick={handleMenuClick} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}