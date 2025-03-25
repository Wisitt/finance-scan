'use client';

import { APP_NAME } from '@/constants/app';
import { Wallet } from 'lucide-react';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
}

/**
 * Component แสดงโลโก้ของแอพพลิเคชัน
 * สามารถเลือกแสดงเฉพาะไอคอนหรือพร้อมข้อความได้
 */
export function AppLogo({ className = '', showText = true }: AppLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-primary p-1 rounded text-white">
        <Wallet className="h-5 w-5" />
      </div>
      {showText && <h2 className="font-bold text-lg">{APP_NAME}</h2>}
    </div>
  );
} 