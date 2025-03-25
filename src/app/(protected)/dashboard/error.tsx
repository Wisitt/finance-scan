'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-bold mb-4">เกิดข้อผิดพลาด</h1>
        <p className="mb-6">
          {error.message || 'เกิดข้อผิดพลาดในการโหลดหน้า dashboard กรุณาลองใหม่อีกครั้ง'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>ลองใหม่</Button>
          <Button variant="outline" asChild>
            <Link href="/">กลับหน้าแรก</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 