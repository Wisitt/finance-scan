'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/constants/routes';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BarChart3, CreditCard, LayoutDashboard, LogIn, ScanLine } from 'lucide-react';

/**
 * Home page with sign in button
 */
export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(APP_ROUTES.DASHBOARD);
    }
  }, [session, status, router]);

  // Handle Google sign in
  const handleSignIn = () => {
    signIn('google', { callbackUrl: APP_ROUTES.DASHBOARD });
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="h-12 w-12 bg-primary/20 rounded-full mx-auto"></div>
          </div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">ระบบจัดการการเงินส่วนบุคคล</h1>
          <p className="text-lg text-muted-foreground mb-8">
            จัดการรายรับรายจ่าย วิเคราะห์พฤติกรรมการใช้จ่าย และวางแผนการเงินได้อย่างมีประสิทธิภาพ
          </p>
          
          {status === 'authenticated' ? (
            <Button size="lg" onClick={() => router.push(APP_ROUTES.DASHBOARD)}>
              <LayoutDashboard className="mr-2 h-5 w-5" />
              ไปที่แดชบอร์ด
            </Button>
          ) : (
            <Button size="lg" onClick={handleSignIn}>
              <LogIn className="mr-2 h-5 w-5" />
              เข้าสู่ระบบด้วย Google
            </Button>
          )}
        </div>

        <Separator className="my-8" />

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <ScanLine className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>สแกนใบเสร็จ</CardTitle>
              <CardDescription>
                แค่ถ่ายรูปใบเสร็จ ระบบจะบันทึกค่าใช้จ่ายให้คุณโดยอัตโนมัติ
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>วิเคราะห์การใช้จ่าย</CardTitle>
              <CardDescription>
                ดูรายงานและกราฟวิเคราะห์พฤติกรรมการใช้จ่ายเพื่อวางแผนการเงินได้ดีขึ้น
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>จัดการธุรกรรม</CardTitle>
              <CardDescription>
                บันทึกรายรับรายจ่าย จัดหมวดหมู่ และติดตามยอดคงเหลือได้อย่างง่ายดาย
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-primary text-white mb-12">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">เริ่มต้นจัดการการเงินของคุณวันนี้</h2>
              <p className="mb-6">
                เริ่มต้นใช้งานฟรี ไม่มีค่าใช้จ่ายซ่อนเร้น
              </p>
              {status !== 'authenticated' && (
                <Button variant="outline" size="lg" className="bg-white/20 hover:bg-white/30 border-white" onClick={handleSignIn}>
                  เริ่มใช้งานทันที
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground">
          <p>© 2025 FinanceTrack</p>
        </footer>
      </div>
    </div>
  );
}