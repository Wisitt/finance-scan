'use client';

import { Toaster } from 'react-hot-toast';
import DashboardLayout from './DashboardLayout';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <Toaster position="top-right" />
    </>
  );
}
