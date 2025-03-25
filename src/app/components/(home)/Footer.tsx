import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "ผลิตภัณฑ์",
      links: [
        { name: 'คุณสมบัติ', href: '/features' },
        { name: 'แผนราคา', href: '/pricing' },
        { name: 'รีวิวจากผู้ใช้', href: '/testimonials' },
        { name: 'คำถามที่พบบ่อย', href: '/faq' },
      ]
    },
    {
      title: "บริษัท",
      links: [
        { name: 'เกี่ยวกับเรา', href: '/about' },
        { name: 'ติดต่อเรา', href: '/contact' },
        { name: 'ข่าวสาร', href: '/news' },
        { name: 'ร่วมงานกับเรา', href: '/careers' },
      ]
    },
    {
      title: "กฎหมาย",
      links: [
        { name: 'ความเป็นส่วนตัว', href: '/privacy' },
        { name: 'เงื่อนไขการใช้งาน', href: '/terms' },
        { name: 'นโยบายคุกกี้', href: '/cookies' },
      ]
    },
  ];

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: 'https://facebook.com' },
    { icon: <Twitter className="h-5 w-5" />, href: 'https://twitter.com' },
    { icon: <Instagram className="h-5 w-5" />, href: 'https://instagram.com' },
    { icon: <Mail className="h-5 w-5" />, href: 'mailto:contact@example.com' },
  ];

  return (
    <footer className="bg-background/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">ระบบจัดการการเงินส่วนบุคคล</h3>
              <p className="text-muted-foreground">
                ระบบที่จะช่วยให้คุณจัดการการเงินได้อย่างชาญฉลาด ติดตามค่าใช้จ่าย และบรรลุเป้าหมายทางการเงิน
              </p>
            </div>
            
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((link, i) => (
                <Link 
                  key={i} 
                  href={link.href}
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  {link.icon}
                </Link>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground">
              © {currentYear} ระบบจัดการการเงินส่วนบุคคล<br />
              สงวนลิขสิทธิ์ทั้งหมด
            </p>
          </div>
          
          {footerLinks.map((group, i) => (
            <div key={i}>
              <h4 className="font-medium mb-4 text-lg">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link, j) => (
                  <li key={j}>
                    <Link 
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center">
            สร้างด้วยความใส่ใจ 
            <Heart className="h-4 w-4 text-red-500 mx-1 fill-red-500" /> 
            จากทีมพัฒนา
          </p>
        </div>
      </div>
    </footer>
  );
}