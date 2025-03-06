'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <Wallet className="h-3.5 w-3.5" />
            <span>/</span>
            <span>บัญชี</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">บัญชีการเงิน</h1>
          <p className="text-muted-foreground mt-1">จัดการบัญชีและแหล่งเงินของคุณ</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>บัญชีของฉัน</CardTitle>
          <CardDescription>จัดการบัญชีธนาคารและแหล่งเงินทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-12 text-muted-foreground">
            กำลังพัฒนา...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}