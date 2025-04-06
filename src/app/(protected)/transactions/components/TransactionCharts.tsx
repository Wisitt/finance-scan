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
  Wallet,
  Eye,
  ScanLine
} from 'lucide-react';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { useTransactionCharts } from '@/hooks/useTransactionCharts';
import { motion } from 'framer-motion';

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

// Theme colors aligned with Fin$ight logo
const THEME_COLORS = {
  teal: {
    primary: 'rgba(20, 184, 166, 1)',     // Main teal
    light: 'rgba(20, 184, 166, 0.7)',
    ultraLight: 'rgba(20, 184, 166, 0.3)',
    gradient: ['rgba(20, 184, 166, 0.7)', 'rgba(20, 184, 166, 0.05)']
  },
  blue: {
    primary: 'rgba(6, 182, 212, 1)',      // Electric blue
    light: 'rgba(6, 182, 212, 0.7)',
    ultraLight: 'rgba(6, 182, 212, 0.3)',
    gradient: ['rgba(6, 182, 212, 0.7)', 'rgba(6, 182, 212, 0.05)']
  },
  gold: {
    primary: 'rgba(234, 179, 8, 1)',      // Gold
    light: 'rgba(234, 179, 8, 0.7)',
    ultraLight: 'rgba(234, 179, 8, 0.3)',
    gradient: ['rgba(234, 179, 8, 0.7)', 'rgba(234, 179, 8, 0.05)']
  },
  red: {
    primary: 'rgba(239, 68, 68, 1)',      // Destructive red
    light: 'rgba(239, 68, 68, 0.7)',
    ultraLight: 'rgba(239, 68, 68, 0.3)',
    gradient: ['rgba(239, 68, 68, 0.7)', 'rgba(239, 68, 68, 0.05)']
  }
};

// Custom color palette for charts
const categoryColors = [
  THEME_COLORS.teal.light,
  THEME_COLORS.blue.light,
  THEME_COLORS.gold.light,
  'rgba(124, 58, 237, 0.7)', // Purple
  'rgba(14, 165, 233, 0.7)',  // Sky
  'rgba(236, 72, 153, 0.7)',  // Pink
  'rgba(245, 158, 11, 0.7)',  // Amber
  'rgba(16, 185, 129, 0.7)',  // Emerald
  'rgba(99, 102, 241, 0.7)',  // Indigo
];

export default function TransactionCharts() {
  const { transactions, fetchTransactions, loading: storeLoading } = useTransactionStore();
  const { user } = useAuthUser();
  const { data: session } = useSession();

  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [chartType, setChartType] = useState<'overview' | 'category' | 'trend' | 'comparison'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(chartType);
  
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

  // Animation for tab changes
  useEffect(() => {
    setActiveTab(chartType);
  }, [chartType]);
  
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

  // **1) Overview Chart** - Updated with theme colors
  const overviewData = {
    labels: ['รายรับ', 'รายจ่าย'],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: [THEME_COLORS.teal.light, THEME_COLORS.red.light],
        borderColor: [THEME_COLORS.teal.primary, THEME_COLORS.red.primary],
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  // Doughnut Chart Options - Enhanced with theme styling
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
          font: {
            family: 'system-ui'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleFont: {
          family: 'system-ui',
          size: 14
        },
        bodyFont: {
          family: 'system-ui',
          size: 13
        },
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
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  // Expense Category Data - Enhanced with theme colors
  const expenseCategoryData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: categoryColors.slice(0, Object.keys(expensesByCategory).length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Income Category Data - Enhanced with theme colors
  const incomeCategoryData = {
    labels: Object.keys(incomesByCategory),
    datasets: [
      {
        data: Object.values(incomesByCategory),
        backgroundColor: [
          THEME_COLORS.teal.light,
          THEME_COLORS.blue.light,
          THEME_COLORS.gold.light,
          ...categoryColors.slice(3, 3 + Object.keys(incomesByCategory).length - 3)
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // **2) แนวโน้ม (Trend) Chart** - Enhanced with theme colors
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
          borderColor: THEME_COLORS.teal.primary,
          backgroundColor: (ctx: ScriptableContext<'line'>) => {
            if (!ctx.chart) return THEME_COLORS.teal.ultraLight;
            const canvas = ctx.chart.ctx;
            return generateGradient(canvas, THEME_COLORS.teal.gradient[0], THEME_COLORS.teal.gradient[1]);
          },
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: THEME_COLORS.teal.primary,
        },
        {
          label: 'รายจ่าย',
          data: sortedDates.map(date => dailyData[date].expense),
          borderColor: THEME_COLORS.red.primary,
          backgroundColor: (ctx: ScriptableContext<'line'>) => {
            if (!ctx.chart) return THEME_COLORS.red.ultraLight;
            const canvas = ctx.chart.ctx;
            return generateGradient(canvas, THEME_COLORS.red.gradient[0], THEME_COLORS.red.gradient[1]);
          },
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: THEME_COLORS.red.primary,
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
        ticks: { 
          font: { 
            size: 10,
            family: 'system-ui' 
          } 
        },
      },
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          font: {
            size: 10,
            family: 'system-ui'
          },
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
          font: {
            family: 'system-ui'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleFont: {
          family: 'system-ui',
          size: 12
        },
        bodyFont: {
          family: 'system-ui',
          size: 12
        },
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
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-card to-card/95">
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center">
              {/* Eye-themed loader */}
              <motion.div 
                className="relative w-16 h-16"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
                <div className="absolute inset-3 rounded-full border-2 border-primary/60" />
                <div className="absolute inset-6 rounded-full bg-primary/20" />
                <motion.div 
                  className="absolute left-0 right-0 h-[1px] bg-primary/60" 
                  animate={{ 
                    top: ["30%", "70%", "30%"],
                  }}
                  transition={{ 
                    duration: 2, 
                    ease: "easeInOut", 
                    repeat: Infinity 
                  }}
                />
              </motion.div>
            </CardContent>
          </Card>
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-card to-card/95">
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
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-card to-card/95 pb-3">
            <CardTitle className="text-lg font-medium">ไม่พบข้อมูลธุรกรรม</CardTitle>
            <CardDescription>ในช่วงเวลาที่เลือกยังไม่มีธุรกรรม</CardDescription>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <div className="mb-6 relative">
              <motion.div 
                className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <BarChart3 className="h-8 w-8 text-muted-foreground opacity-60" />
              </motion.div>
              <motion.div 
                className="absolute left-1/2 w-28 h-[1px] bg-primary/30 -translate-x-1/2" 
                animate={{ 
                  top: ["40%", "60%", "40%"],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ 
                  duration: 2, 
                  ease: "easeInOut", 
                  repeat: Infinity 
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              ยังไม่มีข้อมูลธุรกรรมในช่วงเวลานี้ หรือยังไม่ได้เพิ่มรายการ
            </p>
            <Button className="bg-primary hover:bg-primary/90 transition-colors">
              <Plus className="mr-1.5 h-4 w-4" />
              เพิ่มธุรกรรมใหม่
            </Button>
          </CardContent>
        </Card>
      );
    }

    switch (chartType) {
      case 'overview':
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            key="overview"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryCard
                title="รายรับทั้งหมด"
                value={totalIncome}
                icon={TrendingUp}
                color="text-primary"
                bgColor="bg-primary/10"
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
                color={(totalIncome - totalExpense) >= 0 ? 'text-accent' : 'text-destructive'}
                bgColor={(totalIncome - totalExpense) >= 0 ? 'bg-accent/10' : 'bg-destructive/10'}
                compareText={`${savingsRate.toFixed(1)}%`}
                compareColor={(totalIncome - totalExpense) >= 0 ? 'text-accent' : 'text-destructive'}
                progressValue={Math.min(savingsRate, 100)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border/50 overflow-hidden shadow-sm hover:shadow-md hover:shadow-primary/5 transition-shadow">
                <CardHeader className="bg-gradient-to-r from-card to-card/95">
                  <CardTitle className="text-sm flex items-center">
                    <PieChart className="h-4 w-4 mr-2 text-primary" />
                    สัดส่วนรายรับ-รายจ่าย
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 relative">
                  {/* Subtle scanning line effect */}
                  <motion.div 
                    className="absolute left-0 right-0 h-[1px] bg-primary/30 pointer-events-none" 
                    animate={{ 
                      top: ["30%", "70%", "30%"],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ 
                      duration: 3, 
                      ease: "easeInOut", 
                      repeat: Infinity 
                    }}
                  />
                  <div className="h-[250px] flex items-center justify-center">
                    <Doughnut data={overviewData} options={doughnutOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 overflow-hidden shadow-sm hover:shadow-md hover:shadow-primary/5 transition-shadow">
                <CardHeader className="bg-gradient-to-r from-card to-card/95">
                  <CardTitle className="text-sm flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-primary" />
                    คำแนะนำทางการเงิน
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 relative">
                  {/* Subtle scanning line effect */}
                  <motion.div 
                    className="absolute left-0 right-0 h-[1px] bg-primary/30 pointer-events-none" 
                    animate={{ 
                      top: ["20%", "80%", "20%"],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ 
                      duration: 4, 
                      ease: "easeInOut", 
                      repeat: Infinity 
                    }}
                  />
                
                  {financialInsights.map((txt, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-start py-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.2 }}
                    >
                      <InsightIndicator />
                      <p className="text-sm ml-3">{txt}</p>
                    </motion.div>
                  ))}
                  
                  {/* Financial health score */}
                  <div className="mt-5 pt-4 border-t border-border/40">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-muted-foreground">สุขภาพทางการเงิน</span>
                      <span className="text-xs font-medium text-primary">
                        {savingsRate > 20 ? 'ดีมาก' : savingsRate > 10 ? 'ดี' : 'ต้องปรับปรุง'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-primary/80 to-accent" 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(savingsRate * 3, 100)}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                      
                      {/* Scanning effect on progress bar */}
                      <motion.div 
                        className="absolute top-0 bottom-0 w-[2px] bg-background/70 rounded-full"
                        style={{ height: '1.5px' }}
                        animate={{ 
                          left: ["0%", `${Math.min(savingsRate * 3, 95)}%`, "0%"],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          ease: "easeInOut", 
                          repeat: Infinity,
                          repeatDelay: 0.5
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case 'category':
        return (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            key="category"
          >
            <Card className="border-border/50 overflow-hidden shadow-sm hover:shadow-md hover:shadow-primary/5 transition-shadow">
              <CardHeader className="bg-gradient-to-r from-card to-card/95">
                <CardTitle className="text-sm flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-destructive" />
                  หมวดหมู่รายจ่าย
                </CardTitle>
                <CardDescription>
                  รวม {formatCurrency(totalExpense)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1 relative">
                {/* Scanning line effect */}
                <motion.div 
                  className="absolute left-0 right-0 h-[1px] bg-destructive/30 pointer-events-none" 
                  animate={{ 
                    top: ["20%", "70%", "20%"],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ 
                    duration: 3, 
                    ease: "easeInOut", 
                    repeat: Infinity 
                  }}
                />
                <div className="h-[220px] mb-3">
                  {Object.keys(expensesByCategory).length ? (
                    <Doughnut data={expenseCategoryData} options={doughnutOptions} />
                  ) : (
                    <NoCategoryData text="ไม่มีหมวดหมู่รายจ่าย" />
                  )}
                </div>
                {sortedExpenseCategories.length > 0 && (
                  <CategoryList title="หมวดหมู่ที่ใช้จ่ายสูง" items={sortedExpenseCategories} type="expense" />
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 overflow-hidden shadow-sm hover:shadow-md hover:shadow-primary/5 transition-shadow">
              <CardHeader className="bg-gradient-to-r from-card to-card/95">
                <CardTitle className="text-sm flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-primary" />
                  หมวดหมู่รายรับ
                </CardTitle>
                <CardDescription>
                  รวม {formatCurrency(totalIncome)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1 relative">
                {/* Scanning line effect */}
                <motion.div 
                  className="absolute left-0 right-0 h-[1px] bg-primary/30 pointer-events-none" 
                  animate={{ 
                    top: ["30%", "60%", "30%"],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ 
                    duration: 3.5, 
                    ease: "easeInOut", 
                    repeat: Infinity 
                  }}
                />
                <div className="h-[220px] mb-3">
                  {Object.keys(incomesByCategory).length ? (
                    <Doughnut data={incomeCategoryData} options={doughnutOptions} />
                  ) : (
                    <NoCategoryData text="ไม่มีหมวดหมู่รายรับ" />
                  )}
                </div>
                {sortedIncomeCategories.length > 0 && (
                  <CategoryList title="หมวดหมู่ที่รับสูง" items={sortedIncomeCategories} type="income" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'trend':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            key="trend"
          >
            <Card className="border-border/50 overflow-hidden shadow-sm hover:shadow-md hover:shadow-primary/5 transition-shadow">
              <CardHeader className="bg-gradient-to-r from-card to-card/95">
                <CardTitle className="text-sm flex items-center">
                  <LineChart className="h-4 w-4 mr-2 text-primary" />
                  แนวโน้มรายรับรายจ่าย
                </CardTitle>
                <CardDescription>
                  {getTimeRangeLabel(timeRange)}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                {/* Scanning line effect */}
                <motion.div 
                  className="absolute left-0 right-0 h-[1px] bg-primary/30 pointer-events-none" 
                  animate={{ 
                    top: ["20%", "80%", "20%"],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ 
                    duration: 4, 
                    ease: "easeInOut", 
                    repeat: Infinity 
                  }}
                />
              
                <div className="h-[300px]">
                  {trendData.labels.length ? (
                    <Line data={trendData} options={lineOptions} />
                  ) : (
                    <NoCategoryData text="ไม่มีข้อมูลแนวโน้ม" />
                  )}
                </div>
                
                {/* Performance insights */}
                {trendData.labels.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary/80"></div>
                        <span>รายรับเฉลี่ย: <span className="font-medium">{formatCurrency(totalIncome / (trendData.labels.length || 1))}</span>/วัน</span>
                      </div>
                      <span className="mx-2 text-muted-foreground">|</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-destructive/80"></div>
                        <span>รายจ่ายเฉลี่ย: <span className="font-medium">{formatCurrency(totalExpense / (trendData.labels.length || 1))}</span>/วัน</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-lg font-bold flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            รายงานทางการเงิน
          </h2>
          <p className="text-sm text-muted-foreground">
            แสดงข้อมูลธุรกรรมของ {user?.name} ณ วันที่ 
            {" " + format(new Date(), 'd MMM yyyy', { locale: th })}
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Tabs 
            value={chartType} 
            onValueChange={(value: string) =>
              setChartType(value as 'overview' | 'category' | 'trend' | 'comparison')
            }            
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full bg-muted/50 p-1 rounded-md relative overflow-hidden">
              {/* Animated highlight for active tab */}
              <motion.div 
                className="absolute top-1 bottom-1 rounded-sm bg-card shadow-sm"
                layoutId="tab-highlight"
                transition={{ type: "spring", duration: 0.5 }}
                style={{ 
                  width: "calc(100% / 3)",
                  left: activeTab === 'overview' ? '0%' : 
                        activeTab === 'category' ? '33.333%' : '66.666%'
                }}
              />
              
              <TabsTrigger 
                value="overview" 
                className="text-xs data-[state=active]:text-primary data-[state=active]:shadow-none relative z-10"
              >
                <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                ภาพรวม
              </TabsTrigger>
              <TabsTrigger 
                value="category" 
                className="text-xs data-[state=active]:text-primary data-[state=active]:shadow-none relative z-10"
              >
                <PieChart className="h-3.5 w-3.5 mr-1" />
                หมวดหมู่
              </TabsTrigger>
              <TabsTrigger 
                value="trend" 
                className="text-xs data-[state=active]:text-primary data-[state=active]:shadow-none relative z-10"
              >
                <LineChart className="h-3.5 w-3.5 mr-1" />
                แนวโน้ม
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={timeRange} onValueChange={(val: TimeRange) => setTimeRange(val)}>
            <SelectTrigger className="w-full sm:w-[180px] border-border/50 bg-card">
              <Calendar className="h-3.5 w-3.5 mr-2 text-primary" />
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
        </motion.div>
      </div>

      {renderChart()}
    </div>
  );
}

// Enhanced CategoryList with eye-theme styling
function CategoryList({ title, items, type = 'expense' }: { title: string; items: [string, number][]; type?: 'income' | 'expense' }) {
  return (
    <div className="mt-3 border-t pt-3 space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-medium text-muted-foreground">{title}</h4>
        <div className={`h-1 w-1 rounded-full ${type === 'income' ? 'bg-primary/80' : 'bg-destructive/80'}`} />
      </div>
      {items.map(([cat, amt], i) => (
        <motion.div 
          key={i} 
          className="flex items-center justify-between text-sm"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <span className="truncate w-2/3 flex items-center">
            <div 
              className={`h-1.5 w-1.5 rounded-full mr-1.5 ${type === 'income' ? 'bg-primary/80' : 'bg-destructive/80'}`} 
            />
            {cat}
          </span>
          <span className={type === 'income' ? 'text-primary font-medium' : 'text-destructive font-medium'}>
            {formatCurrency(amt)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// Enhanced NoCategory with eye-theme styling
function NoCategoryData({ text }: { text: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
      <motion.div 
        className="relative w-14 h-14 mb-3"
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="absolute inset-0 rounded-full bg-muted flex items-center justify-center">
          <PieChart className="h-6 w-6 opacity-40" />
        </div>
        <motion.div 
          className="absolute left-0 right-0 h-[1px] bg-primary/30" 
          animate={{ 
            top: ["30%", "70%", "30%"],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 2, 
            ease: "easeInOut", 
            repeat: Infinity 
          }}
        />
      </motion.div>
      {text}
    </div>
  );
}

// Enhanced visual insight indicator with eye theme
function InsightIndicator() {
  return (
    <div className="mt-0.5 relative">
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.1, 0.3] 
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"
        animate={{ rotate: [0, 10, 0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Eye className="h-3 w-3 text-primary" />
      </motion.div>
    </div>
  );
}