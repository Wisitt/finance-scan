'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import Layout from '@/components/layout/Layout';

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const { setCurrentUser } = useUserStore();
  
  useEffect(() => {

  }, [setCurrentUser]);
  
  return <Layout>{children}</Layout>;
}