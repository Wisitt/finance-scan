'use client';

import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BellRing, ChevronRight, CreditCard, TrendingUp } from 'lucide-react';

export function DashboardCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`
      rounded-3xl border overflow-hidden shadow-2xl 
      ${isDark 
        ? 'bg-[#111111] border-[#333]' 
        : 'bg-white border-gray-200'}
    `}>
      {/* Header */}
      <div className={`
        p-4 flex items-center justify-between border-b
        ${isDark 
          ? 'bg-[#222222] border-[#333]' 
          : 'bg-gray-50 border-gray-200'}
      `}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className={`
          flex items-center text-xs font-medium
          ${isDark ? 'text-[#BBBBBB]' : 'text-gray-500'}
        `}>
        </div>
      </div>

      {/* Content */}
      <div className={`
        p-6
        ${isDark 
          ? 'bg-gradient-to-br from-[#111111] via-[#1A1A1A] to-[#222222]' 
          : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'}
      `}>

        {/* Balance cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Balance card */}
          <div className={`
            rounded-xl p-4 border
            ${isDark 
              ? 'bg-[#1F1F1F] border-[#333]' 
              : 'bg-white border-gray-200'}
          `}>
            <div className={`text-xs mb-1 ${isDark ? 'text-[#AAAAAA]' : 'text-gray-500'}`}>
              ยอดคงเหลือ
            </div>
            <div className="text-2xl font-semibold">฿124,500</div>
            <div className="flex items-center gap-1 text-xs text-green-400 mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+4.3% จากเดือนที่แล้ว</span>
            </div>
          </div>

          {/* Expenses card */}
          <div className={`
            rounded-xl p-4 border
            ${isDark 
              ? 'bg-[#1F1F1F] border-[#333]' 
              : 'bg-white border-gray-200'}
          `}>
            <div className={`text-xs mb-1 ${isDark ? 'text-[#AAAAAA]' : 'text-gray-500'}`}>
              ค่าใช้จ่ายเดือนนี้
            </div>
            <div className="text-2xl font-semibold">฿18,245</div>
            <div className={`
              flex items-center gap-1 text-xs mt-2
              ${isDark ? 'text-[#AAAAAA]' : 'text-gray-500'}
            `}>
              <span>เป้าหมาย: ฿30,000</span>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className={`
          rounded-xl p-4 border mb-6
          ${isDark 
            ? 'bg-[#1F1F1F] border-[#333]' 
            : 'bg-white border-gray-200'}
        `}>
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium">กิจกรรมล่าสุด</div>
            <Badge
              variant="outline"
              className={`
                text-xs
                ${isDark 
                  ? 'border-[#666] text-[#AAAAAA]' 
                  : 'border-gray-300 text-gray-500'}
              `}
            >
              วันนี้
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Transaction 1 */}
            <div className={`
              flex items-center justify-between py-1 border-b border-dashed
              ${isDark ? 'border-[#444]' : 'border-gray-200'}
            `}>
              <div className="flex items-center gap-2">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${isDark ? 'bg-red-200/[0.15]' : 'bg-red-100'}
                `}>
                  <CreditCard className="h-3 w-3 text-red-400" />
                </div>
                <span className={`
                  text-sm
                  ${isDark ? 'text-[#DDDDDD]' : 'text-gray-700'}
                `}>
                  ร้านอาหาร
                </span>
              </div>
              <span className="text-sm font-medium">-฿450</span>
            </div>

            {/* Transaction 2 */}
            <div className={`
              flex items-center justify-between py-1 border-b border-dashed
              ${isDark ? 'border-[#444]' : 'border-gray-200'}
            `}>
              <div className="flex items-center gap-2">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${isDark ? 'bg-green-200/[0.15]' : 'bg-green-100'}
                `}>
                  <TrendingUp className="h-3 w-3 text-green-400" />
                </div>
                <span className={`
                  text-sm
                  ${isDark ? 'text-[#DDDDDD]' : 'text-gray-700'}
                `}>
                  เงินเดือน
                </span>
              </div>
              <span className="text-sm font-medium text-green-400">
                +฿45,000
              </span>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            className={`
              rounded-lg
              ${isDark 
                ? 'text-[#AAAAAA] border-[#666]' 
                : 'text-gray-500 border-gray-300'}
            `}
          >
            <BellRing className="h-4 w-4 mr-1" />
            <span
            >แจ้งเตือน</span>
          </Button>
          <Button
            size="sm"
            className={`
                rounded-lg
                ${isDark 
                  ? 'text-[#AAAAAA] border-[#666]' 
                  : 'text-gray-500 border-gray-300'}
              `}
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            <span>ดูรายงาน</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}