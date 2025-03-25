import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { NavItem } from '@/constants/navitem';

/**
 * Custom hook เพื่อตรวจสอบว่าเมนูใดกำลังถูกเลือกอยู่
 * จะตรวจสอบจาก pathname ปัจจุบันเทียบกับรูปแบบที่กำหนดในแต่ละเมนู
 */
export function useActiveMenu(items: NavItem[]) {
  const pathname = usePathname();

  // ฟังก์ชันสำหรับตรวจสอบว่าเส้นทางปัจจุบันตรงกับเมนูใด
  const isMenuActive = useMemo(() => {
    return (href: string, pattern?: RegExp) => {
      // กรณีมีการกำหนด pattern ไว้
      if (pattern) {
        return pattern.test(pathname);
      }
      
      // กรณีเป็นหน้า dashboard และผู้ใช้อยู่ที่หน้า dashboard
      if (href === '/dashboard' && pathname === '/dashboard') {
        return true;
      }
      
      // กรณีอื่นๆ ตรวจสอบว่า pathname เริ่มต้นด้วย href หรือไม่
      if (href !== '/dashboard') {
        return pathname.startsWith(href);
      }
      
      return false;
    };
  }, [pathname]);
  
  return { isMenuActive };
} 