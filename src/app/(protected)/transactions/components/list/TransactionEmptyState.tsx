'use client';

import { FileText } from 'lucide-react';

interface TransactionEmptyStateProps {
  message?: string;
}

export default function TransactionEmptyState({ 
  message = 'ไม่พบรายการธุรกรรม' 
}: TransactionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
      </div>
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      <p className="text-muted-foreground max-w-md">
        ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหาของคุณ ลองเปลี่ยนตัวกรองหรือคำค้นหา
      </p>
    </div>
  );
}