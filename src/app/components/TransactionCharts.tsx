/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { useAuthUser } from '@/hook/useAuthUser';

import { 
  format, 
  subDays, 
  parseISO, 
  isWithinInterval,
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  addDays 
} from 'date-fns';
import { th } from 'date-fns/locale';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

import { cn } from '@/utils/utils';
import {
  ArrowDown,
  BarChart3, 
  Calendar,
  Clock,
  DollarSign,
  Download,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  Loader2,
  PieChart,
  Plus,
  RefreshCw,
  Tag,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

// Chart.js register
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// กำหนด Time Range
type TimeRange = '7days' | '30days' | '90days' | 'all' | 'thisMonth' | 'lastMonth';

// ฟังก์ชัน format วันแบบย่อไทย
const formatThaiShortDate = (date: Date): string => {
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  return `${day} ${month}`;
};

// ฟังก์ชัน format สกุลเงินแบบไทย
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function TransactionCharts() {
  const { transactions } = useTransactionStore();
  const { user } = useAuthUser();

  // ฟิลเตอร์ & UI States
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [chartType, setChartType] = useState<'overview' | 'category' | 'trend' | 'comparison'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Loading state จำลอง
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [timeRange, chartType]);

  // แปลง TimeRange เป็น label ภาษาไทย
  const getTimeRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case '7days':    return '7 วันล่าสุด';
      case '30days':   return '30 วันล่าสุด';
      case '90days':   return '90 วันล่าสุด';
      case 'thisMonth':return 'เดือนนี้';
      case 'lastMonth':return 'เดือนที่แล้ว';
      case 'all':      return 'ทั้งหมด';
      default:         return '30 วันล่าสุด';
    }
  };

  // คัดกรองธุรกรรมตามช่วงเวลา
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    if (timeRange === 'all') return transactions;

    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (timeRange) {
      case '7days':
        startDate = subDays(today, 7);
        break;
      case '30days':
        startDate = subDays(today, 30);
        break;
      case '90days':
        startDate = subDays(today, 90);
        break;
      case 'thisMonth':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      default:
        startDate = subDays(today, 30);
    }

    return transactions.filter(tx => {
      const txDate = parseISO(tx.date);
      return isWithinInterval(txDate, { start: startDate, end: endDate });
    });
  }, [transactions, timeRange]);

  // สรุปข้อมูล
  const {
    totalIncome, 
    totalExpense, 
    incomesByCategory, 
    expensesByCategory, 
    dailyData
  } = useMemo(() => {
    const result = {
      totalIncome: 0,
      totalExpense: 0,
      incomesByCategory: {} as Record<string, number>,
      expensesByCategory: {} as Record<string, number>,
      dailyData: {} as Record<string, { income: number; expense: number }>,
    };

    if (!filteredTransactions.length) return result;

    // เตรียม dailyData (เฉพาะถ้าไม่ใช่ all)
    const today = new Date();
    let daysToShow = 30;

    switch (timeRange) {
      case '7days':    daysToShow = 7; break;
      case '30days':   daysToShow = 30; break;
      case '90days':   daysToShow = 90; break;
      case 'thisMonth':{
        daysToShow = endOfMonth(today).getDate() - startOfMonth(today).getDate() + 1;
        break;
      }
      case 'lastMonth':{
        const last = subMonths(today, 1);
        daysToShow = endOfMonth(last).getDate() - startOfMonth(last).getDate() + 1;
        break;
      }
    }

    if (timeRange !== 'all') {
      let startDate: Date;
      if (timeRange === 'thisMonth') {
        startDate = startOfMonth(today);
      } else if (timeRange === 'lastMonth') {
        startDate = startOfMonth(subMonths(today, 1));
      } else {
        startDate = subDays(today, daysToShow - 1);
      }

      for (let i = 0; i < daysToShow; i++) {
        const date = addDays(startDate, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        result.dailyData[dateStr] = { income: 0, expense: 0 };
      }
    }

    // รวมข้อมูล
    filteredTransactions.forEach(tx => {
      const dateStr = tx.date.split('T')[0];

      if (tx.type === 'income') {
        result.totalIncome += tx.amount;
        result.incomesByCategory[tx.category] = (result.incomesByCategory[tx.category] || 0) + tx.amount;
        if (result.dailyData[dateStr]) {
          result.dailyData[dateStr].income += tx.amount;
        }
      } else {
        result.totalExpense += tx.amount;
        result.expensesByCategory[tx.category] = (result.expensesByCategory[tx.category] || 0) + tx.amount;
        if (result.dailyData[dateStr]) {
          result.dailyData[dateStr].expense += tx.amount;
        }
      }
    });

    return result;
  }, [filteredTransactions, timeRange]);

  // คำนวณอัตราการออม
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // จัดเรียง Top หมวดหมู่
  const sortedExpenseCategories = useMemo(() => {
    return Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [expensesByCategory]);

  const sortedIncomeCategories = useMemo(() => {
    return Object.entries(incomesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [incomesByCategory]);

  // ฟังก์ชันสร้าง gradient ให้กราฟ
  const generateGradient = (ctx: CanvasRenderingContext2D, color1: string, color2: string) => {
    if (!ctx) return '#fff';
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  };

  // **1) Overview Chart**
  const overviewData = {
    labels: ['รายรับ', 'รายจ่าย'],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ['rgba(34, 211, 238, 0.7)', 'rgba(249, 115, 22, 0.7)'],
        borderColor: ['rgb(8, 145, 178)', 'rgb(194, 65, 12)'],
        hoverOffset: 15,
      },
    ],
  };

  // Doughnut Chart Options
  const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const pct = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${formatCurrency(value)} (${pct}%)`;
          }
        }
      }
    },
  };

  // Expense Category Data
  const expenseCategoryData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 88, 12, 0.7)',
          'rgba(220, 38, 38, 0.7)',
          'rgba(252, 211, 77, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(45, 212, 191, 0.7)',
          'rgba(236, 72, 153, 0.7)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Income Category Data
  const incomeCategoryData = {
    labels: Object.keys(incomesByCategory),
    datasets: [
      {
        data: Object.values(incomesByCategory),
        backgroundColor: [
          'rgba(34, 211, 238, 0.7)',
          'rgba(6, 182, 212, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(14, 165, 233, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // **2) แนวโน้ม (Trend) Chart**
  const trendData = useMemo(() => {
    if (!Object.keys(dailyData).length) {
      return { labels: [], datasets: [] };
    }

    const sortedDates = Object.keys(dailyData).sort();
    return {
      labels: sortedDates.map(date => formatThaiShortDate(parseISO(date))),
      datasets: [
        {
          label: 'รายรับ',
          data: sortedDates.map(date => dailyData[date].income),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: (ctx: any) => {
            if (!ctx.chart) return 'rgba(16, 185, 129, 0.3)';
            const canvas = ctx.chart.ctx;
            return generateGradient(canvas, 'rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.05)');
          },
          fill: true,
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: 'รายจ่าย',
          data: sortedDates.map(date => dailyData[date].expense),
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: (ctx: any) => {
            if (!ctx.chart) return 'rgba(239, 68, 68, 0.3)';
            const canvas = ctx.chart.ctx;
            return generateGradient(canvas, 'rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.05)');
          },
          fill: true,
          tension: 0.3,
          pointRadius: 2,
        }
      ]
    };
  }, [dailyData]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(tickValue: number | string) {
            const val = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            return formatCurrency(val).replace('฿', '');
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    animation: { duration: 800 },
  };

  // **3) เปรียบเทียบ (Comparison)**
  const comparisonData = useMemo(() => {
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    const currentMonthEnd = endOfMonth(today);

    const lastMonthDate = subMonths(today, 1);
    const lastMonthStart = startOfMonth(lastMonthDate);
    const lastMonthEnd = endOfMonth(lastMonthDate);

    const currentMonthTxs = transactions.filter(tx => {
      const d = parseISO(tx.date);
      return isWithinInterval(d, { start: currentMonthStart, end: currentMonthEnd });
    });
    const lastMonthTxs = transactions.filter(tx => {
      const d = parseISO(tx.date);
      return isWithinInterval(d, { start: lastMonthStart, end: lastMonthEnd });
    });

    const currentIncome = currentMonthTxs.filter(tx => tx.type === 'income').reduce((s, x) => s + x.amount, 0);
    const currentExpense = currentMonthTxs.filter(tx => tx.type === 'expense').reduce((s, x) => s + x.amount, 0);

    const lastIncome = lastMonthTxs.filter(tx => tx.type === 'income').reduce((s, x) => s + x.amount, 0);
    const lastExpense = lastMonthTxs.filter(tx => tx.type === 'expense').reduce((s, x) => s + x.amount, 0);

    const incomeGrowth = lastIncome ? ((currentIncome - lastIncome) / lastIncome) * 100 : 100;
    const expenseGrowth = lastExpense ? ((currentExpense - lastExpense) / lastExpense) * 100 : 100;

    return {
      months: {
        current: format(today, 'MMMM', { locale: th }),
        last: format(lastMonthDate, 'MMMM', { locale: th }),
      },
      data: {
        currentMonthIncome: currentIncome,
        currentMonthExpense: currentExpense,
        lastMonthIncome: lastIncome,
        lastMonthExpense: lastExpense,
        incomeGrowth,
        expenseGrowth,
      },
      chartData: {
        labels: ['รายรับ', 'รายจ่าย'],
        datasets: [
          {
            label: format(lastMonthDate, 'MMM', { locale: th }),
            data: [lastIncome, lastExpense],
            backgroundColor: 'rgba(156, 163, 175, 0.6)',
            borderWidth: 1,
          },
          {
            label: format(today, 'MMM', { locale: th }),
            data: [currentIncome, currentExpense],
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderWidth: 1,
          },
        ],
      }
    };
  }, [transactions]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(tickValue: number | string) {
            const val = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            return formatCurrency(val).replace('฿', '');
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    animation: { duration: 800 },
  };

  // **คำแนะนำ (Insights) เรียบง่าย**
  const financialInsights = useMemo(() => {
    const result: string[] = [];
    if (filteredTransactions.length < 3) {
      result.push('ยังมีข้อมูลธุรกรรมไม่เพียงพอสำหรับคำแนะนำที่ชัดเจน');
      return result;
    }
    if (savingsRate < 10) {
      result.push("อัตราการออมต่ำกว่า 10% แนะนำให้ปรับลดรายจ่ายไม่จำเป็น");
    } else if (savingsRate > 30) {
      result.push(`อัตราการออมสูงถึง ${savingsRate.toFixed(0)}% ถือว่าดีมาก!`);
    }
    if (totalExpense > totalIncome) {
      result.push("รายจ่ายรวมสูงกว่ารายรับในช่วงนี้ ควรพิจารณาวางแผนเพิ่มรายได้/ลดรายจ่าย");
    }
    if (!result.length) {
      result.push("การติดตามและจดบันทึกธุรกรรมอย่างสม่ำเสมอช่วยให้คุณวางแผนการเงินได้ดีขึ้น");
    }
    return result;
  }, [filteredTransactions.length, savingsRate, totalExpense, totalIncome]);

  // **ฟังก์ชัน Render กราฟตามโหมด chartType**
  const renderChart = () => {
    // 1) Loading
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
            </CardHeader>
            <CardContent className="h-[250px] flex flex-col items-center justify-center space-y-3">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        </div>
      );
    }

    // 2) ไม่มีข้อมูล
    if (!filteredTransactions.length) {
      return (
        <Card className="bg-white border p-6 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground opacity-30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">ไม่พบข้อมูลธุรกรรม</h3>
          <p className="text-sm text-muted-foreground mb-4">
            ยังไม่มีข้อมูลธุรกรรมในช่วงเวลานี้ หรือยังไม่ได้เพิ่มรายการ
          </p>
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            เพิ่มธุรกรรมใหม่
          </Button>
        </Card>
      );
    }

    // 3) มีข้อมูล => เลือกตาม chartType
    switch (chartType) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* รายรับ */}
              <Card className="border">
                <CardHeader className="pb-2">
                  <CardDescription>รายรับทั้งหมด</CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(totalIncome)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {getTimeRangeLabel(timeRange)}
                  </p>
                </CardContent>
              </Card>

              {/* รายจ่าย */}
              <Card className="border">
                <CardHeader className="pb-2">
                  <CardDescription>รายจ่ายทั้งหมด</CardDescription>
                  <CardTitle className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(totalExpense)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {getTimeRangeLabel(timeRange)}
                  </p>
                </CardContent>
              </Card>

              {/* คงเหลือ + อัตราออม */}
              <Card className="border">
                <CardHeader className="pb-2">
                  <CardDescription>ยอดคงเหลือ</CardDescription>
                  <CardTitle 
                    className={cn(
                      "text-2xl font-bold mt-1",
                      (totalIncome - totalExpense) >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {formatCurrency(totalIncome - totalExpense)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">อัตราออม</span>
                    <span className="text-xs font-medium">
                      {savingsRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(savingsRate, 100)} className="h-1.5" />
                </CardContent>
              </Card>
            </div>

            {/* Donut Chart สัดส่วนรายรับ-รายจ่าย และคำแนะนำ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <PieChart className="h-4 w-4 mr-2 text-primary" />
                    สัดส่วนรายรับ-รายจ่าย
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[250px] flex items-center justify-center">
                    <Doughnut data={overviewData} options={doughnutOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                    คำแนะนำทางการเงิน
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {financialInsights.map((txt, i) => (
                    <div key={i} className="flex items-start">
                      <ArrowRightIndicator />
                      <p className="text-sm ml-2">{txt}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'category':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Expense Categories */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-red-600" />
                  หมวดหมู่รายจ่าย
                </CardTitle>
                <CardDescription>
                  รวม {formatCurrency(totalExpense)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="h-[220px] mb-3">
                  {Object.keys(expensesByCategory).length ? (
                    <Doughnut data={expenseCategoryData} options={doughnutOptions} />
                  ) : (
                    <NoCategoryData text="ไม่มีหมวดหมู่รายจ่าย" />
                  )}
                </div>
                {/* รายจ่ายสูงสุด */}
                {sortedExpenseCategories.length > 0 && (
                  <CategoryList title="หมวดหมู่ที่ใช้จ่ายสูง" items={sortedExpenseCategories} />
                )}
              </CardContent>
            </Card>

            {/* Income Categories */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-green-600" />
                  หมวดหมู่รายรับ
                </CardTitle>
                <CardDescription>
                  รวม {formatCurrency(totalIncome)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="h-[220px] mb-3">
                  {Object.keys(incomesByCategory).length ? (
                    <Doughnut data={incomeCategoryData} options={doughnutOptions} />
                  ) : (
                    <NoCategoryData text="ไม่มีหมวดหมู่รายรับ" />
                  )}
                </div>
                {/* รายรับสูงสุด */}
                {sortedIncomeCategories.length > 0 && (
                  <CategoryList title="หมวดหมู่ที่รับสูง" items={sortedIncomeCategories} />
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'trend':
        return (
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <LineChart className="h-4 w-4 mr-2 text-primary" />
                แนวโน้มรายรับรายจ่าย
              </CardTitle>
              <CardDescription>
                {getTimeRangeLabel(timeRange)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {trendData.labels.length ? (
                  <Line data={trendData} options={lineOptions} />
                ) : (
                  <NoCategoryData text="ไม่มีข้อมูลแนวโน้ม" />
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'comparison':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar Chart เปรียบเทียบเดือน */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                  เปรียบเทียบรายเดือน
                </CardTitle>
                <CardDescription>
                  {comparisonData.months.last} &amp; {comparisonData.months.current}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar data={comparisonData.chartData} options={barOptions} />
                </div>
              </CardContent>
            </Card>

            {/* รายรับ-รายจ่ายเดือนที่แล้ว/เดือนนี้ */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-sm">สรุปการเปลี่ยนแปลง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ComparisonRow 
                  label="รายรับ"
                  iconColor="text-green-600"
                  lastValue={comparisonData.data.lastMonthIncome}
                  currentValue={comparisonData.data.currentMonthIncome}
                  growth={comparisonData.data.incomeGrowth}
                  lastLabel={comparisonData.months.last}
                  currentLabel={comparisonData.months.current}
                />
                <ComparisonRow 
                  label="รายจ่าย"
                  iconColor="text-red-600"
                  lastValue={comparisonData.data.lastMonthExpense}
                  currentValue={comparisonData.data.currentMonthExpense}
                  growth={comparisonData.data.expenseGrowth}
                  lastLabel={comparisonData.months.last}
                  currentLabel={comparisonData.months.current}
                />
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  อัปเดตข้อมูล
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            รายงานทางการเงิน
          </h2>
          <p className="text-sm text-muted-foreground">
            แสดงข้อมูลธุรกรรมของ {user?.name} ณ วันที่ 
            {" " + format(new Date(), 'd MMM yyyy', { locale: th })}
          </p>
        </div>

        {/* Tabs & TimeRange */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Tabs 
            value={chartType} 
            onValueChange={(v) => setChartType(v as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview" className="text-xs">
                <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                ภาพรวม
              </TabsTrigger>
              <TabsTrigger value="category" className="text-xs">
                <PieChart className="h-3.5 w-3.5 mr-1" />
                หมวดหมู่
              </TabsTrigger>
              <TabsTrigger value="trend" className="text-xs">
                <LineChart className="h-3.5 w-3.5 mr-1" />
                แนวโน้ม
              </TabsTrigger>
              <TabsTrigger value="comparison" className="text-xs">
                <BarChart3 className="h-3.5 w-3.5 mr-1" />
                เปรียบเทียบ
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={timeRange} onValueChange={(val) => setTimeRange(val as TimeRange)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="เลือกช่วงเวลา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 วันล่าสุด</SelectItem>
              <SelectItem value="30days">30 วันล่าสุด</SelectItem>
              <SelectItem value="90days">90 วันล่าสุด</SelectItem>
              <SelectItem value="thisMonth">เดือนนี้</SelectItem>
              <SelectItem value="lastMonth">เดือนที่แล้ว</SelectItem>
              <SelectItem value="all">ทั้งหมด</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Render กราฟ/รายงานหลัก */}
      {renderChart()}

      {/* Footer เล็ก ๆ */}
      <Card className="border mt-6">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              อัปเดตล่าสุด: {format(new Date(), 'dd MMM yyyy, HH:mm:ss', { locale: th })}
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            ดาวน์โหลดข้อมูล
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------
  ส่วนประกอบ UI ย่อยเล็ก ๆ เพื่อให้โค้ดหลักอ่านง่ายขึ้น
----------------------------------------------------- */

// แสดงหมวดหมู่กับยอด
function CategoryList({ title, items }: { title: string; items: [string, number][] }) {
  return (
    <div className="mt-3 border-t pt-3 space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground">{title}</h4>
      {items.map(([cat, amt], i) => (
        <div key={i} className="flex items-center justify-between text-sm">
          <span className="truncate w-2/3">{cat}</span>
          <span>{formatCurrency(amt)}</span>
        </div>
      ))}
    </div>
  );
}

// กรณีไม่มีข้อมูลใน chart
function NoCategoryData({ text }: { text: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
      <PieChart className="h-8 w-8 mb-1 opacity-30" />
      {text}
    </div>
  );
}

// แสดงสัญลักษณ์ลูกศร พร้อมข้อความย่อ
function ArrowRightIndicator() {
  return (
    <div className="text-primary">
      <ArrowDown className="rotate-270 h-4 w-4" />
    </div>
  );
}

// แถวเปรียบเทียบ รายรับ/รายจ่าย เดือนปัจจุบัน vs. เดือนที่แล้ว
function ComparisonRow(props: {
  label: string;
  iconColor: string;
  lastValue: number;
  currentValue: number;
  growth: number;
  lastLabel: string;
  currentLabel: string;
}) {
  const { label, iconColor, lastValue, currentValue, growth, lastLabel, currentLabel } = props;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-medium flex items-center">
          <DollarSign className={cn("h-4 w-4 mr-1", iconColor)} />
          {label}
        </h4>
        <Badge variant={growth >= 0 ? "default" : "outline"} className="text-xs">
          {growth >= 0 ? "+" : ""}
          {growth.toFixed(1)}%
        </Badge>
      </div>
      <div className="flex justify-between items-center text-xs">
        <div>
          <p className="text-muted-foreground">{lastLabel}</p>
          <p className="font-medium">{formatCurrency(lastValue)}</p>
        </div>
        <div className="px-2">
          {growth >= 0 ? (
            <TrendingUp className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-500" />
          )}
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">{currentLabel}</p>
          <p className="font-medium">{formatCurrency(currentValue)}</p>
        </div>
      </div>
    </div>
  );
}
