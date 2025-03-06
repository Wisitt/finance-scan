'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import DashboardLayout from '../components/DashboardLayout';

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const { setCurrentUser } = useUserStore();
  
  useEffect(() => {

  }, [setCurrentUser]);
  
  return <DashboardLayout>{children}</DashboardLayout>;
}