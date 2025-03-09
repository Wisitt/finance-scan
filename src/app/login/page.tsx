'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

function ActualLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // หากมี callbackUrl ให้ดึงมา ไม่งั้นกลับหน้า '/'
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <p>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-1 text-2xl font-bold">FinScan</h1>
          <p className="text-center text-sm text-muted-foreground">
            บันทึกรายรับรายจ่ายและสแกนใบเสร็จ
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full py-6 text-base"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>การเข้าสู่ระบบถือว่าคุณยอมรับ</p>
            <p>ข้อกำหนดในการใช้งานและนโยบายความเป็นส่วนตัวของเรา</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ActualLoginPage />
    </Suspense>
  );
}
