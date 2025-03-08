'use client';

import { useState, useEffect } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { format,parseISO } from 'date-fns';
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
  Plus,
  LayoutDashboard,
  ArrowUpRight,
  UserPlus,
  Settings2,
  Info,
  Filter,
  MoreHorizontal,
  ExternalLink,
  ArrowRight
} from 'lucide-react';


import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import TransactionCharts from '../components/TransactionCharts';
import { useSession } from 'next-auth/react';
import ReceiptScanner from '@/app/components/ReceiptScanner';

export default function DashBoardPage() {
  const { data: session } = useSession();
  const { fetchCategories, transactions, loadingTransactions, fetchTransactions } = useTransactionStore();
  const [currentDateTime] = useState(new Date('2025-03-06 08:15:47'));
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const currentUser = session?.user;
  // Calculate greeting based on time of day
  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  };

  // Calculate quick stats
  const calculateStats = () => {
    if (!transactions || transactions.length === 0) {
      return { income: 0, expense: 0, balance: 0, recentTransactions: [] };
    }

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const balance = income - expense;
    
    // Get recent transactions
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
      
    return { income, expense, balance, recentTransactions };
  };
  
  const { income, expense, balance, recentTransactions } = calculateStats();

  // Get date for "Last updated"
  const lastUpdated = new Date('2025-03-06 08:15:47');

  useEffect(() => {
    // Load categories
    fetchCategories();
    
    // Load transactions if user is selected
    if (currentUser) {
      fetchTransactions(currentUser.id);
    }
    
    // Simulate initial loading
    const loadTimer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => {
      clearTimeout(loadTimer);
    };
  }, [fetchCategories, fetchTransactions, currentUser]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      {/* Page Header & Quick actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <Home className="h-3.5 w-3.5" />
            <span>/</span>
            <span>หน้าแรก</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">แดชบอร์ด</h1>
          <p className="text-muted-foreground mt-1">จัดการรายรับรายจ่ายและดูภาพรวมทางการเงิน</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            ตัวกรอง
          </Button>
          
          <Button variant="secondary" size="sm">
            <ScanLine className="h-3.5 w-3.5 mr-1.5" />
            สแกนใบเสร็จ
          </Button>
          
          <Button size="sm">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            เพิ่มธุรกรรม
          </Button>
        </div>
      </div>
      
      {/* User Welcome Card */}
      <Card className="mb-6 overflow-hidden border-none bg-gradient-to-br from-primary/90 via-primary to-primary/80 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-full opacity-10">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0 L100,0 L100,100 Z" fill="white" />
          </svg>
        </div>
        <CardContent className="p-6 text-white relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
                <Clock className="h-3 w-3 mr-1" />
                {format(currentDateTime, 'EEEE, d MMMM yyyy', { locale: th })} • {format(currentDateTime, 'HH:mm')}
              </Badge>
              
              <h2 className="text-xl sm:text-2xl font-bold">{getGreeting()}, {currentUser ? currentUser.name : 'Wisitt'}</h2>
              <p className="opacity-90">ยินดีต้อนรับกลับมาที่ระบบจัดการการเงินส่วนบุคคลของคุณ</p>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Button size="sm" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                  เริ่มจัดการเงินของคุณ
                </Button>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/20 hover:bg-white/30">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>เรียนรู้วิธีใช้งานแดชบอร์ด</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="hidden sm:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center">
                <div className="flex gap-2 items-center">
                  <div className="bg-white/20 p-2 rounded-full">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-medium">สถานะการเงิน</span>
                </div>
                <Separator className="my-2 bg-white/20" />
                <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
                <p className="text-xs opacity-80">ยอดสุทธิ</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Stats */}
      <section aria-label="สรุปสถานะการเงิน" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Balance Card */}
          <Card className={cn(
            "overflow-hidden shadow-sm transition-all hover:shadow-md",
            loading ? "animate-pulse" : ""
          )}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardDescription className="flex items-center">
                  <Wallet className="h-4 w-4 mr-1.5 text-primary" />
                  <span>ยอดคงเหลือ</span>
                </CardDescription>
                <Badge variant="outline" className="font-normal">ปัจจุบัน</Badge>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-40 mt-1" />
              ) : (
                <CardTitle className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(balance)}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">อัตราการออม</span>
                  <span className={cn(
                    "font-medium",
                    income > 0 && (balance / income * 100) >= 20 ? "text-green-600" : (balance < 0 ? "text-red-600" : "text-amber-600")
                  )}>
                    {income > 0 ? Math.round((balance / income) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={income > 0 ? Math.min((balance / income) * 100, 100) : 0} 
                  className="h-1.5"
                  style={{ backgroundColor: income > 0 && (balance / income * 100) >= 20 ? "bg-green-600" : (balance < 0 ? "bg-red-600" : "bg-amber-600") }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Income Card */}
          <Card className="overflow-hidden shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-1.5 text-green-500" />
                <span>รายรับ</span>
              </CardDescription>
              {loading ? (
                <Skeleton className="h-8 w-36 mt-1" />
              ) : (
                <CardTitle className="text-2xl sm:text-3xl text-green-600">
                  {formatCurrency(income)}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent className="pb-4">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Receipt className="h-4 w-4" />
                    {transactions.filter(t => t.type === 'income').length} รายการรับเงิน
                  </p>
                  <Badge variant="outline" className="text-green-600 bg-green-50">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +12%
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Card */}
          <Card className="overflow-hidden shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center">
                <TrendingDown className="h-4 w-4 mr-1.5 text-red-500" />
                <span>รายจ่าย</span>
              </CardDescription>
              {loading ? (
                <Skeleton className="h-8 w-36 mt-1" />
              ) : (
                <CardTitle className="text-2xl sm:text-3xl text-red-600">
                  {formatCurrency(expense)}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent className="pb-4">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4" />
                    {transactions.filter(t => t.type === 'expense').length} รายการจ่ายเงิน
                  </p>
                  <Badge variant="outline" className="text-red-600 bg-red-50">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +5%
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b">
          <TabsList className="h-10 w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
            <TabsTrigger 
              value="dashboard" 
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              แดชบอร์ด
            </TabsTrigger>
            <TabsTrigger 
              value="scan" 
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <ScanLine className="h-4 w-4 mr-2" />
              สแกนใบเสร็จ
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              ตั้งค่า
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {currentUser ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Charts - Takes 2/3 of width on large screens */}
                <div className="lg:col-span-2">
                  <TransactionCharts />
                </div>
                
                {/* Recent Transactions - Takes 1/3 of width on large screens */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Receipt className="h-4 w-4 mr-2 text-primary" />
                          รายการล่าสุด
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Plus className="h-4 w-4 mr-2" />
                              เพิ่มรายการใหม่
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Filter className="h-4 w-4 mr-2" />
                              กรองรายการ
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              ดูทั้งหมด
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {loading || loadingTransactions ? (
                        <div className="space-y-4 p-6">
                          {[1,2,3].map(i => (
                            <div key={i} className="flex items-center justify-between">
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                              <Skeleton className="h-6 w-16" />
                            </div>
                          ))}
                        </div>
                      ) : recentTransactions.length > 0 ? (
                        <ScrollArea className="h-[300px]">
                          <div className="divide-y">
                            {recentTransactions.map((transaction, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0",
                                    transaction.type === 'income' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                  )}>
                                    {transaction.type === 'income' ? (
                                      <TrendingUp className="h-4 w-4" />
                                    ) : (
                                      <TrendingDown className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium line-clamp-1">
                                      {transaction.description || transaction.category}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <CalendarDays className="h-3 w-3" />
                                      {format(parseISO(transaction.date), 'd MMM yyyy')}
                                    </p>
                                  </div>
                                </div>
                                <div className={cn(
                                  "font-medium",
                                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                )}>
                                  {transaction.type === 'income' ? '+' : '-'}
                                  {formatCurrency(transaction.amount)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="p-6 text-center text-muted-foreground">
                          <Receipt className="h-10 w-10 mx-auto mb-2 opacity-20" />
                          <p>ไม่มีรายการธุรกรรมล่าสุด</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t p-3">
                      <Button variant="outline" className="w-full gap-1">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        ดูรายการทั้งหมด
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* User Profile Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={currentUser?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {currentUser?.name ? currentUser.name.charAt(0) : "unknow"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{currentUser?.name ? currentUser.name : 'unknow'}</CardTitle>
                        <CardDescription>รายงานส่วนบุคคล</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">รายการทั้งหมด:</span>
                          <span className="font-medium">{transactions.length} รายการ</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">สัดส่วนรายจ่าย:</span>
                          <span className="font-medium">{income > 0 ? Math.round((expense / income) * 100) : 0}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">อัพเดทล่าสุด:</span>
                          <span className="font-medium">
                            {format(lastUpdated, 'HH:mm:ss', { locale: th })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* System Status */}
              <Card className="bg-muted/30">
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">
                      ระบบทำงานปกติ - อัพเดทล่าสุด: {format(new Date('2025-03-06 08:19:59'), 'dd/MM/yyyy HH:mm:ss')}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ผู้ใช้: {currentUser?.name || 'Wisitt'} | เวอร์ชัน: 1.5.2
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-muted/10">
              <CardContent className="p-8">
                <div className="text-center py-6">
                  <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <UserPlus className="h-8 w-8 text-muted-foreground opacity-70" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">ยินดีต้อนรับสู่ระบบจัดการการเงิน</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    เริ่มต้นใช้งานระบบเพื่อจัดการรายรับรายจ่ายและติดตามสถานะทางการเงินของคุณ
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button>เริ่มใช้งานระบบ</Button>
                    <Button variant="outline">เรียนรู้เพิ่มเติม</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Scanner Tab */}
        <TabsContent value="scan">
          <ReceiptScanner />
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าผู้ใช้งาน</CardTitle>
              <CardDescription>
                ปรับแต่งการตั้งค่าส่วนบุคคลและการแจ้งเตือน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-12">
                กำลังพัฒนา...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}