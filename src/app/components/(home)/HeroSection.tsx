import { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { ArrowRight, LayoutDashboard, LogIn, BarChart2 } from 'lucide-react';
import Image from 'next/image';

interface HeroSectionProps {
  session: Session | null;
  username?: string;
  onDashboardClick: () => void;
  onLoginClick: () => void;
}

export default function HeroSection({ session, username, onDashboardClick, onLoginClick }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background z-0"></div>
      <div className="absolute inset-0 bg-[url('/dots-pattern.png')] opacity-5 z-0"></div>
      
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            {session && (
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium text-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                สวัสดี, {username || 'คุณ'} 👋
              </div>
            )}
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                บริหารการเงิน
              </span>
              <br/>
              <span>อย่างชาญฉลาด</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              จัดการรายรับรายจ่าย วิเคราะห์พฤติกรรมการใช้จ่าย และวางแผนการเงินได้อย่างมีประสิทธิภาพ
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {session ? (
                <Button 
                  size="lg" 
                  onClick={onDashboardClick}
                  className="font-medium text-base"
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  ไปที่แดชบอร์ด
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={onLoginClick}
                    className="font-medium text-base group"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    เข้าสู่ระบบ
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => window.open('/demo', '_blank')}
                    className="font-medium text-base"
                  >
                    ทดลองใช้งาน
                  </Button>
                </>
              )}
            </div>
            
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">
                      {i}K
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">10,000+</span> ผู้ใช้งานทั่วประเทศ
              </p>
            </div>
          </div>
          
          <div className="relative z-10 hidden lg:block">
            <div className="relative p-2 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <BarChart2 className="h-6 w-6 text-white" />
              </div>
              
              {/* This would be your dashboard preview image */}
              <div className="bg-background/80 rounded-xl overflow-hidden">
                <div className="h-[400px] w-full relative">
                  {/* Replace with your actual dashboard image */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-background/50">
                    <div className="text-center p-4">
                      <h3 className="text-lg font-medium mb-2">ภาพตัวอย่างแดชบอร์ด</h3>
                      <p className="text-muted-foreground">แสดงข้อมูลการเงินของคุณแบบเรียลไทม์</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}