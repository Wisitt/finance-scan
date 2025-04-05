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
  TrendingUp,
  TrendingDown,
  Receipt,
  UserPlus,
  Settings2,
  ExternalLink,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import Link from 'next/link';
import { TransactionCharts } from '../transactions';
import ReceiptScanner from '../scan/page';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';


export default function DashBoardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { transactions , fetchTransactions } = useTransactionStore();

  const {
    summary,
  } = useTransactionFilters(transactions);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.id) {
      async function loadData() {
        try {
          await fetchTransactions();
        } catch (error) {
          console.error('Error fetching transactions:', error);
        } finally {
          setLoading(false);
        }
      }
      
      loadData();
    }
  }, [status, router, session, fetchTransactions]);

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }


  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);


  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

 
  const lastUpdated = new Date('2025-03-06 08:19:59');

  return (
    <>
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
      
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <SummaryCard
          title="รายรับ"
          value={summary.totalIncome}
          icon={TrendingUp}
          color="text-success"
          bgColor="bg-success/10"
          loading={loading}
          compareText="+12%"
          compareColor="text-success"
          progressValue={75}
        />
        <SummaryCard
          title="รายจ่าย"
          value={summary.totalExpense}
          icon={TrendingDown}
          color="text-destructive"
          bgColor="bg-destructive/10"
          loading={loading}
          compareText="+8%"
          compareColor="text-destructive"
          progressValue={65}
        />
                <SummaryCard
          title="ยอดคงเหลือ"
          value={summary.balance}
          icon={Wallet}
          color={(summary.totalIncome - summary.totalExpense) >= 0 ? 'text-green-600' : 'text-red-600'}
          bgColor={(summary.totalIncome - summary.totalExpense) >= 0 ? 'bg-green-100' : 'bg-red-100'}
          loading={loading}
          compareText={`${summary.totalIncome > 0 ? Math.round((summary.balance / summary.totalIncome) * 100) : 0}%`}
          compareColor={
            summary.totalIncome > 0 && summary.balance / summary.totalIncome >= 0.2
              ? 'text-success'
              : summary.balance < 0
              ? 'text-destructive'
              : 'text-warning'
          }
          progressValue={summary.totalIncome > 0 ? Math.min((summary.balance / summary.totalIncome) * 100, 100) : 0}
        />
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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

        <TabsContent value="dashboard" className="space-y-4">
          {session?.user.name ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TransactionCharts />
                </div>

                <div className="space-y-6">
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

                  <Card>
                    <CardHeader className="pb-2 flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session?.user.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {session?.user.name ? session?.user.name[0] : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{session?.user.name ?? 'ไม่ทราบชื่อ'}</CardTitle>
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
                    ผู้ใช้: {session?.user.name} | เวอร์ชัน: 1.5.2
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

        <TabsContent value="scan">
          <ReceiptScanner />
        </TabsContent>

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
