'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

function ActualErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (!error) {
      router.push('/');
    }
  }, [error, router]);

  const getErrorMessage = () => {
    switch (error) {
      case 'AccessDenied':
        return 'การเข้าถึงถูกปฏิเสธ โปรดลองอีกครั้ง';
      case 'Verification':
        return 'ไม่สามารถยืนยันอีเมลของคุณได้ โปรดลองอีกครั้ง';
      case 'OAuthSignin':
        return 'เกิดข้อผิดพลาดในขั้นตอนเริ่มต้นการเข้าสู่ระบบ';
      case 'OAuthCallback':
        return 'เกิดข้อผิดพลาดในการตอบกลับจากผู้ให้บริการ';
      case 'Database':
        return 'เกิดข้อผิดพลาดกับฐานข้อมูล';
      default:
        return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้ง';
    }
  };

  const handleClearSession = () => {
    document.cookie.split(';').forEach((cookie) => {
      document.cookie =
        cookie.trim().split('=')[0] +
        '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    });
    localStorage.clear();
    router.push('/');
  };

  if (!error) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-lg text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="mb-2 text-xl font-bold">เกิดข้อผิดพลาด</h1>
        <p className="mb-6 text-muted-foreground">{getErrorMessage()}</p>

        <div className="space-y-3">
          <Button onClick={handleClearSession} variant="outline" className="w-full">
            <RefreshCcw className="h-4 w-4 mr-2" />
            ล้างเซสชั่นและลองใหม่
          </Button>

          <Button asChild className="w-full">
            <Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ActualErrorPage />
    </Suspense>
  );
}
