import { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  session: Session | null;
  onSignupClick: () => void;
}

export default function CTASection({ session, onSignupClick }: CTASectionProps) {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="relative p-12">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                เริ่มต้นจัดการการเงินของคุณวันนี้
              </h2>
              <p className="mb-8 text-white/90 max-w-lg mx-auto">
                เริ่มต้นใช้งานฟรี ไม่มีค่าใช้จ่ายซ่อนเร้น พร้อมฟีเจอร์ครบครันสำหรับการจัดการการเงินอย่างมืออาชีพ
              </p>
              {!session && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
                  <Button 
                    size="lg" 
                    variant="default"
                    onClick={onSignupClick}
                    className="bg-white text-primary hover:bg-white/90 font-medium text-base"
                  >
                    สมัครใช้งานฟรี
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="link"
                    className="text-white hover:text-white/90 font-medium text-base"
                    onClick={() => window.open('/pricing', '_blank')}
                  >
                    ดูแผนการใช้งานทั้งหมด
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}