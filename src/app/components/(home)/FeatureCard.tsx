import { cn } from '@/utils/utils';
import { ScanLine, BarChart3, CreditCard, Target, Bell, Lock } from 'lucide-react';

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
};

export default function FeatureSection() {
  const features: Feature[] = [
    {
      icon: <ScanLine className="h-6 w-6" />,
      title: 'สแกนใบเสร็จอัจฉริยะ',
      description: 'แค่ถ่ายรูปใบเสร็จ ระบบจะบันทึกค่าใช้จ่ายให้คุณโดยอัตโนมัติ ประหยัดเวลาในการป้อนข้อมูล',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'วิเคราะห์การใช้จ่าย',
      description: 'ดูรายงานและกราฟวิเคราะห์พฤติกรรมการใช้จ่ายเพื่อวางแผนการเงินได้ดีขึ้น ค้นพบรูปแบบการใช้จ่าย',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: 'จัดการธุรกรรม',
      description: 'บันทึกรายรับรายจ่าย จัดหมวดหมู่ และติดตามยอดคงเหลือได้อย่างง่ายดาย ไม่พลาดทุกรายการ',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'ตั้งเป้าหมายการออม',
      description: 'กำหนดเป้าหมายการออมและติดตามความคืบหน้าได้อย่างชัดเจน ช่วยให้คุณบรรลุเป้าหมายทางการเงิน',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: 'แจ้งเตือนอัจฉริยะ',
      description: 'รับการแจ้งเตือนเมื่อค่าใช้จ่ายสูงผิดปกติ หรือใกล้ถึงวันชำระค่าบริการต่างๆ ไม่พลาดทุกการชำระ',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: 'ความปลอดภัยสูงสุด',
      description: 'ข้อมูลทางการเงินของคุณได้รับการปกป้องด้วยระบบความปลอดภัยระดับธนาคาร การเข้ารหัสขั้นสูง',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">ฟีเจอร์ที่ตอบโจทย์การบริหารการเงิน</h2>
          <p className="text-muted-foreground">ระบบของเราออกแบบมาให้ใช้งานง่าย แต่มีประสิทธิภาพสูง เพื่อช่วยให้คุณจัดการการเงินได้อย่างมั่นใจ</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 rounded-xl bg-card border border-border hover:shadow-md transition-all duration-300 hover:border-primary/20 group"
            >
              <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center mb-5", feature.bgColor)}>
                <div className={cn("", feature.color)}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}