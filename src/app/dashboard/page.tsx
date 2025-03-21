'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTransactionStore } from '@/store/transactionStore';
import { Transaction } from '@/types';

import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';

import {
  BarChart3,
  ScanLine,
  Home,
  Wallet,
  CalendarDays,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Receipt,
  Clock,
  LayoutDashboard,
  ArrowUpRight,
  UserPlus,
  Settings2,
  Info,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/utils/utils';

import TransactionCharts from '../components/TransactionCharts';
import ReceiptScanner from '@/app/components/ReceiptScanner';
import Link from 'next/dist/client/link';


export default function DashBoardPage() {
  const { data: session } = useSession();
  const currentUser = session?.user;

  const { transactions } = useTransactionStore();


  // ตัวอย่างกำหนดวันเวลาปัจจุบัน (จำลอง)
  const [currentDateTime] = useState(new Date('2025-03-06 08:15:47'));
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // โหลดข้อมูล categories และ transactions
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [currentUser,transactions.length]);

  // ฟอร์แมตสกุลเงิน
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // คำนวณรายรับ-รายจ่าย-ยอดคงเหลือ
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  // หารายการล่าสุด
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // คำทักทายตามช่วงเวลา
  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  };

  // วันเวลาที่ใช้แสดง "อัปเดตล่าสุด"
  const lastUpdated = new Date('2025-03-06 08:19:59');

  return (
    <>
      {/* ส่วนหัวของหน้า + ปุ่มช่วยเหลือด่วน */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-1">
            <Home className="h-3.5 w-3.5" />
            <span>/</span>
            <span>หน้าแรก</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">แดชบอร์ด</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            จัดการรายรับรายจ่ายและดูภาพรวมทางการเงิน
          </p>
        </div>
        </div>

      {/* การ์ดต้อนรับผู้ใช้งาน */}
      <Card className="mb-6 border bg-primary text-white">
        <CardContent className="p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
                <Clock className="h-3 w-3 mr-1" />
                {format(currentDateTime, 'd MMM yyyy', { locale: th })} •{' '}
                {format(currentDateTime, 'HH:mm')}
              </Badge>
              <h2 className="mt-2 text-lg sm:text-xl font-bold">
                {getGreeting()}, {currentUser ? currentUser.name : 'ผู้ใช้'}
              </h2>
              <p className="opacity-90 text-sm sm:text-base mt-1">
                ยินดีต้อนรับกลับมาที่ระบบจัดการการเงินของคุณ
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <ArrowRight className="h-3.5 w-3.5 mr-1" />
                  เริ่มจัดการเงินของคุณ
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>เรียนรู้วิธีใช้งานแดชบอร์ด</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* แสดงยอดคงเหลือสั้น ๆ */}
            <div className="hidden sm:block">
              <div className="bg-white/10 rounded-md p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="bg-white/20 p-1.5 rounded-full">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">สถานะการเงิน</span>
                </div>
                <Separator className="mb-2 bg-white/20" />
                <p className="text-xl font-bold">{formatCurrency(balance)}</p>
                <p className="text-xs opacity-90">ยอดสุทธิ</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* สรุปสถิติหลัก (Balance, Income, Expense) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* บัตรแสดงยอดคงเหลือ */}
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="flex items-center gap-1">
                <Wallet className="h-4 w-4 text-primary" />
                <span>ยอดคงเหลือ</span>
              </CardDescription>
              <Badge variant="outline" className="font-normal">
                ปัจจุบัน
              </Badge>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <CardTitle className="text-2xl font-bold">{formatCurrency(balance)}</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">อัตราการออม</span>
                <span
                  className={cn(
                    'font-medium',
                    income > 0 && balance / income >= 0.2
                      ? 'text-green-600'
                      : balance < 0
                      ? 'text-red-600'
                      : 'text-amber-600'
                  )}
                >
                  {income > 0 ? Math.round((balance / income) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={income > 0 ? Math.min((balance / income) * 100, 100) : 0}
                className="h-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* บัตรแสดงรายรับ */}
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>รายรับ</span>
            </CardDescription>
            {loading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <CardTitle className="text-xl font-bold text-green-600">
                {formatCurrency(income)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Receipt className="h-4 w-4" />
                  {transactions.filter((t) => t.type === 'income').length} รายการ
                </p>
                <Badge variant="outline" className="text-green-600 bg-green-50">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12%
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* บัตรแสดงรายจ่าย */}
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span>รายจ่าย</span>
            </CardDescription>
            {loading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <CardTitle className="text-xl font-bold text-red-600">
                {formatCurrency(expense)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  {transactions.filter((t) => t.type === 'expense').length} รายการ
                </p>
                <Badge variant="outline" className="text-red-600 bg-red-50">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +5%
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Tabs หลัก: Dashboard / Scanner / Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* แถบเลือก Tab */}
        <TabsList className="border-b mb-2">
          <TabsTrigger
            value="dashboard"
            className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            แดชบอร์ด
          </TabsTrigger>
          <TabsTrigger
            value="scan"
            className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <ScanLine className="h-4 w-4 mr-2" />
            สแกนใบเสร็จ
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Settings2 className="h-4 w-4 mr-2" />
            ตั้งค่า
          </TabsTrigger>
        </TabsList>

        {/* 1) Tab แดชบอร์ด */}
        <TabsContent value="dashboard" className="space-y-4">
          {currentUser ? (
            <>
              {/* กราฟ + รายการล่าสุด */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TransactionCharts />
                </div>

                <div className="space-y-6">
                  {/* รายการล่าสุด */}
                  <Card>
                    <CardHeader className="pb-3 flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-primary" />
                        <span>รายการล่าสุด</span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0 flex flex-col min-h-0">
                      {loading ? (
                        <div className="p-4 space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                              <div className="space-y-1.5">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                              <Skeleton className="h-5 w-16" />
                            </div>
                          ))}
                        </div>
                      ) : recentTransactions.length > 0 ? (
                        <div className="flex-1 min-h-0">
                          <ScrollArea className="max-h-64 md:max-h-80 overflow-auto">
                            <div className="divide-y">
                              {recentTransactions.map((tx: Transaction, idx) => (
                                <div
                                  key={idx}
                                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={cn(
                                        'h-8 w-8 flex items-center justify-center rounded-full',
                                        tx.type === 'income'
                                          ? 'bg-green-100 text-green-600'
                                          : 'bg-red-100 text-red-600'
                                      )}
                                    >
                                      {tx.type === 'income' ? (
                                        <TrendingUp className="h-4 w-4" />
                                      ) : (
                                        <TrendingDown className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium truncate w-40 sm:w-56 md:w-64 lg:w-72">
                                        {tx.description || tx.category}
                                      </p>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <CalendarDays className="h-3 w-3" />
                                        {format(parseISO(tx.date), 'd MMM yyyy', { locale: th })}
                                      </p>
                                    </div>
                                  </div>
                                  <div
                                    className={cn(
                                      'text-sm font-medium',
                                      tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                                    )}
                                  >
                                    {tx.type === 'income' ? '+' : '-'}
                                    {formatCurrency(tx.amount)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          <Receipt className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <div>ไม่มีรายการธุรกรรมล่าสุด</div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t p-3">
                      <Link href="/transactions" className="w-full">
                        <Button variant="outline" className="w-full justify-center">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          ดูทั้งหมด
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>

                  {/* User Profile Card */}
                  <Card>
                    <CardHeader className="pb-2 flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={currentUser?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {currentUser?.name ? currentUser.name[0] : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{currentUser?.name ?? 'ไม่ทราบชื่อ'}</CardTitle>
                        <CardDescription>รายงานส่วนบุคคล</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">รายการทั้งหมด</span>
                        <span className="font-medium">{transactions.length} รายการ</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">สัดส่วนรายจ่าย</span>
                        <span className="font-medium">
                          {income > 0 ? Math.round((expense / income) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">อัปเดตล่าสุด</span>
                        <span className="font-medium">
                          {format(lastUpdated, 'HH:mm:ss', { locale: th })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* System Status (ตัวอย่างข้อความสถานะ) */}
              <Card className="bg-muted/20">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      ระบบทำงานปกติ - อัปเดตล่าสุด:{' '}
                      {format(lastUpdated, 'd/M/yyyy HH:mm:ss')}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    ผู้ใช้: {currentUser?.name} | เวอร์ชัน: 1.5.2
                  </span>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-muted/10">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <UserPlus className="h-8 w-8 text-muted-foreground opacity-60" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">ยินดีต้อนรับสู่ระบบจัดการการเงิน</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-4">
                    เริ่มต้นใช้งานได้เลยเพื่อบริหารรายรับรายจ่ายและติดตามสถานะทางการเงิน
                  </p>
                  <div className="flex gap-3">
                    <Button>เริ่มใช้งาน</Button>
                    <Button variant="outline">เรียนรู้เพิ่มเติม</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 2) Tab สแกนใบเสร็จ */}
        <TabsContent value="scan">
          <ReceiptScanner />
        </TabsContent>

        {/* 3) Tab ตั้งค่า */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าผู้ใช้งาน</CardTitle>
              <CardDescription>ปรับแต่งการตั้งค่าบัญชีและการแจ้งเตือน</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-12 text-sm">
                อยู่ระหว่างพัฒนา...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
