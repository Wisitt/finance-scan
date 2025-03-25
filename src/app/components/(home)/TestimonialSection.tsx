import { cn } from '@/utils/utils';
import { Star } from 'lucide-react';

type Testimonial = {
  content: string;
  author: string;
  role: string;
  rating: number;
};

export default function TestimonialSection() {
  const testimonials: Testimonial[] = [
    {
      content: "นี่เป็นแอปที่เปลี่ยนชีวิตการจัดการเงินของผมไปเลย แต่ก่อนผมเก็บเงินไม่ค่อยอยู่ แต่ตอนนี้ผมสามารถออมเงินได้ 20% ของรายได้ทุกเดือน",
      author: "คุณสมศักดิ์ มีเงินออม",
      role: "วิศวกร",
      rating: 5,
    },
    {
      content: "ฟีเจอร์การสแกนใบเสร็จช่วยให้ผมประหยัดเวลาได้มาก ไม่ต้องพิมพ์ข้อมูลเอง และยังช่วยจำแนกประเภทค่าใช้จ่ายได้แม่นยำมาก",
      author: "คุณนภาพร รักการออม",
      role: "นักการตลาด",
      rating: 4,
    },
    {
      content: "แอปนี้ช่วยให้ผมและภรรยาสามารถวางแผนการเงินร่วมกันได้ง่ายขึ้น เราสามารถบรรลุเป้าหมายการซื้อบ้านเร็วกว่าที่คิดไว้ถึง 2 ปี",
      author: "คุณวรพล ครอบครัวมั่นคง",
      role: "เจ้าของธุรกิจ",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">เสียงจากผู้ใช้งานจริง</h2>
          <p className="text-muted-foreground">
            ฟังเสียงจากผู้ใช้งานที่ประสบความสำเร็จในการจัดการการเงินส่วนบุคคลกับเรา
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={cn(
                "p-6 rounded-xl border border-border relative",
                "before:absolute before:content-[''] before:w-10 before:h-10",
                "before:bg-primary/5 before:rounded-full before:-z-10",
                "before:-top-3 before:-left-3",
                "hover:shadow-lg transition-all duration-300"
              )}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "h-4 w-4", 
                      i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
                    )} 
                  />
                ))}
              </div>
              <blockquote className="text-foreground mb-4 italic">
                "{testimonial.content}"
              </blockquote>
              <div className="mt-auto pt-4 border-t border-border/50">
                <div className="font-medium">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}