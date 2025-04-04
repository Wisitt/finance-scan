'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useSession } from 'next-auth/react';

import { 
  format, 
  parseISO, 
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
  ScriptableContext,
  TooltipItem,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

import {
  ArrowDown,
  BarChart3, 
  Calendar,
  Clock,
  Download,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  Loader2,
  PieChart,
  Plus,
  Tag,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { useTransactionCharts } from '@/hooks/useTransactionCharts';

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

type TimeRange = '7days' | '30days' | '90days' | 'all' | 'thisMonth' | 'lastMonth';

const formatThaiShortDate = (date: Date): string => {
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  return `${day} ${month}`;
};


export default function TransactionCharts() {
  const { transactions, fetchTransactions, loading: storeLoading } = useTransactionStore();
  const { user } = useAuthUser();
  const { data: session } = useSession();

  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [chartType, setChartType] = useState<'overview' | 'category' | 'trend' | 'comparison'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const {
    filteredTransactions,
    totalIncome,
    totalExpense,
    savingsRate,
    incomesByCategory,
    expensesByCategory,
    dailyData,
    sortedExpenseCategories,
    sortedIncomeCategories,
  } = useTransactionCharts(transactions, timeRange);
  

  useEffect(() => {
    const loadData = async () => {
      if (session?.user?.id) {
        try {
          await fetchTransactions();
        } catch (error) {
          console.error("Error fetching transaction data:", error);
        }
      }
    };
    
    loadData();
  }, [session?.user?.id, fetchTransactions]);



  useEffect(() => {
    if (storeLoading) {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [storeLoading, timeRange, chartType]);
  
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
          label: function(context: TooltipItem<'doughnut'>) {
            const label = context.label || '';
            const value = (context.raw as number) ?? 0;
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
          backgroundColor: (ctx: ScriptableContext<'line'>) => {
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
          backgroundColor: (ctx: ScriptableContext<'line'>) => {
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
          label: function(context: TooltipItem<'line'>) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    animation: { duration: 800 },
  };

  
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

  const renderChart = () => {
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

    switch (chartType) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryCard
                title="รายรับทั้งหมด"
                value={totalIncome}
                icon={TrendingUp}
                color="text-success"
                bgColor="bg-success/10"
                compareText={getTimeRangeLabel(timeRange)}
                compareColor="text-muted-foreground"
              />
              <SummaryCard
                title="รายจ่ายทั้งหมด"
                value={totalExpense}
                icon={TrendingDown}
                color="text-destructive"
                bgColor="bg-destructive/10"
                compareText={getTimeRangeLabel(timeRange)}
                compareColor="text-muted-foreground"
              />
              <SummaryCard
                title="ยอดคงเหลือ"
                value={totalIncome - totalExpense}
                icon={Wallet}
                color={(totalIncome - totalExpense) >= 0 ? 'text-green-600' : 'text-red-600'}
                bgColor={(totalIncome - totalExpense) >= 0 ? 'bg-green-100' : 'bg-red-100'}
                compareText={`${savingsRate.toFixed(1)}%`}
                compareColor="text-muted-foreground"
                progressValue={Math.min(savingsRate, 100)}
              />
            </div>

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
                {sortedExpenseCategories.length > 0 && (
                  <CategoryList title="หมวดหมู่ที่ใช้จ่ายสูง" items={sortedExpenseCategories} />
                )}
              </CardContent>
            </Card>

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
    }
  };

  return (
    <div className="space-y-6">
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Tabs 
            value={chartType} 
            onValueChange={(value: string) =>
              setChartType(value as 'overview' | 'category' | 'trend' | 'comparison')
            }            
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full">
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
            </TabsList>
          </Tabs>

          <Select value={timeRange} onValueChange={(val: TimeRange) => setTimeRange(val)}>
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

      {renderChart()}

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

function NoCategoryData({ text }: { text: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
      <PieChart className="h-8 w-8 mb-1 opacity-30" />
      {text}
    </div>
  );
}

function ArrowRightIndicator() {
  return (
    <div className="text-primary">
      <ArrowDown className="rotate-270 h-4 w-4" />
    </div>
  );
}
