'use client';

import { useState } from 'react';
import { cn } from '@/utils/utils';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import Header from './header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { status } = useSession();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // หน้าที่ไม่ต้องมี layout
  const isPublicPage = pathname === '/login' || pathname === '/error';
  
  if (isPublicPage || status === 'unauthenticated') {
    return <>{children}</>;
  }
  
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <div>กำลังโหลด...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <MobileNavigation />
      <Sidebar 
        isSidebarCollapsed={isSidebarCollapsed} 
        setSidebarCollapsed={setSidebarCollapsed} 
      />
      <main className={cn(
        "flex min-h-screen flex-col transition-all duration-300",
        isSidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[250px]"
      )}>
        <Header />
        <div className={cn(
          "flex-1",
          pathname !== '/scan' ? "p-4 md:p-6" : ""
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}