/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { format, subDays, parseISO, isWithinInterval, startOfMonth, endOfMonth, subMonths, addDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  ChevronRight,
  CircleDollarSign,
  Clock,
  DollarSign,
  Download,
  HelpCircle,
  Info,
  LayoutDashboard,
  LineChart,
  Loader2,
  PieChart,
  Plus,
  RefreshCw,
  Tag,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs,TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUserStore } from '@/store/userStore';

// Register Chart.js components
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

// Define time range type
type TimeRange = '7days' | '30days' | '90days' | 'all' | 'thisMonth' | 'lastMonth';

// Format date to Thai short format (e.g., 5 ม.ค.)
const formatThaiShortDate = (date: Date): string => {
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  
  return `${day} ${month}`;
};

// Format currency in Thai format
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
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [chartType, setChartType] = useState<'overview' | 'category' | 'trend' | 'comparison'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  
  // Simulate loading effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [timeRange, chartType]);
  
  // Get time range description
  const getTimeRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case '7days': return '7 วันล่าสุด';
      case '30days': return '30 วันล่าสุด';
      case '90days': return '90 วันล่าสุด';
      case 'thisMonth': return 'เดือนนี้';
      case 'lastMonth': return 'เดือนที่แล้ว';
      case 'all': return 'ทั้งหมด';
      default: return '30 วันล่าสุด';
    }
  };
  
  // Filter transactions based on selected time range
  const filteredTransactions = useMemo(() => {
    if (transactions.length === 0) return [];
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
  
  // Calculate financial summaries
  const { totalIncome, totalExpense, incomesByCategory, expensesByCategory, dailyData } = useMemo(() => {
    const totals = {
      totalIncome: 0,
      totalExpense: 0,
      incomesByCategory: {} as Record<string, number>,
      expensesByCategory: {} as Record<string, number>,
      dailyData: {} as Record<string, { income: number; expense: number; }>,
    };
    
    if (filteredTransactions.length === 0) {
      return totals;
    }
    
    // Initialize daily data with zeros for the selected time range
    const today = new Date();
    let daysToShow = 30;
    
    switch (timeRange) {
      case '7days': daysToShow = 7; break;
      case '30days': daysToShow = 30; break;
      case '90days': daysToShow = 90; break;
      case 'thisMonth': 
        daysToShow = endOfMonth(today).getDate() - startOfMonth(today).getDate() + 1;
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        daysToShow = endOfMonth(lastMonth).getDate() - startOfMonth(lastMonth).getDate() + 1;
        break;
    }
    
    // Don't initialize daily data for 'all' time range
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
        totals.dailyData[dateStr] = { income: 0, expense: 0 };
      }
    }
    
    // Process transaction data
    filteredTransactions.forEach(tx => {
      const dateStr = tx.date.split('T')[0];
      
      // Add to daily data if within range
      if (timeRange !== 'all') {
        // Make sure the date exists in our dailyData object
        if (!totals.dailyData[dateStr]) {
          totals.dailyData[dateStr] = { income: 0, expense: 0 };
        }
      }
      
      if (tx.type === 'income') {
        totals.totalIncome += tx.amount;
        totals.incomesByCategory[tx.category] = (totals.incomesByCategory[tx.category] || 0) + tx.amount;
        if (timeRange !== 'all' && totals.dailyData[dateStr]) {
          totals.dailyData[dateStr].income += tx.amount;
        }
      } else {
        totals.totalExpense += tx.amount;
        totals.expensesByCategory[tx.category] = (totals.expensesByCategory[tx.category] || 0) + tx.amount;
        if (timeRange !== 'all' && totals.dailyData[dateStr]) {
          totals.dailyData[dateStr].expense += tx.amount;
        }
      }
    });
    
    return totals;
  }, [filteredTransactions, timeRange]);

  // Sort and prepare category data
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

  // Calculate savings rate
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  
  // Generate color gradients for charts
  const generateGradient = (ctx: any, color1: string, color2: string) => {
    if (!ctx) return '#fff';
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  };
  
  // Overview chart data
  const overviewData = {
    labels: ['รายรับ', 'รายจ่าย'],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ['rgba(34, 211, 238, 0.7)', 'rgba(249, 115, 22, 0.7)'],
        borderColor: ['rgb(8, 145, 178)', 'rgb(194, 65, 12)'],
        borderWidth: 1,
        hoverOffset: 15,
      },
    ],
  };
  
  // Category chart options
  const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 15,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
            const percentageValue = percentage ? Math.round((value / percentage) * 100) : 0;
            return `${label}: ${formatCurrency(value)} (${percentageValue}%)`;
          }
        }
      }
    },
  };
  
  // Expense category chart data with better colors
  const expenseCategoryData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          'rgba(249, 115, 22, 0.7)', // Orange
          'rgba(234, 88, 12, 0.7)',  // Darker orange
          'rgba(249, 168, 212, 0.7)', // Pink
          'rgba(136, 19, 55, 0.7)',   // Burgundy
          'rgba(220, 38, 38, 0.7)',   // Red
          'rgba(252, 211, 77, 0.7)',  // Yellow
          'rgba(16, 185, 129, 0.7)',  // Green
          'rgba(45, 212, 191, 0.7)',  // Teal
          'rgba(59, 130, 246, 0.7)',  // Blue
          'rgba(168, 85, 247, 0.7)',  // Purple
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };
  
  // Income category chart data
  const incomeCategoryData = {
    labels: Object.keys(incomesByCategory),
    datasets: [
      {
        data: Object.values(incomesByCategory),
        backgroundColor: [
          'rgba(34, 211, 238, 0.7)',  // Light Blue
          'rgba(8, 145, 178, 0.7)',   // Darker Blue
          'rgba(6, 182, 212, 0.7)',   // Cyan
          'rgba(16, 185, 129, 0.7)',  // Green
          'rgba(5, 150, 105, 0.7)',   // Dark Green
          'rgba(14, 165, 233, 0.7)',  // Sky
          'rgba(79, 70, 229, 0.7)',   // Indigo
          'rgba(168, 85, 247, 0.7)',  // Purple
          'rgba(217, 70, 239, 0.7)',  // Fuchsia
          'rgba(236, 72, 153, 0.7)',  // Pink
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };
  
  // Trend chart data
  const trendData = useMemo(() => {
    if (Object.keys(dailyData).length === 0) {
      return {
        labels: [],
        datasets: [
          { label: 'รายรับ', data: [], borderColor: 'rgba(16, 185, 129, 1)' },
          { label: 'รายจ่าย', data: [], borderColor: 'rgba(239, 68, 68, 1)' }
        ]
      };
    }

    const sortedDates = Object.keys(dailyData).sort();
    
    return {
      labels: sortedDates.map(date => formatThaiShortDate(parseISO(date))),
      datasets: [
        {
          label: 'รายรับ',
          data: sortedDates.map(date => dailyData[date].income),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            return generateGradient(ctx, 'rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.02)');
          },
          tension: 0.3,
          fill: true,
          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: 'รายจ่าย',
          data: sortedDates.map(date => dailyData[date].expense),
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            return generateGradient(ctx, 'rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.02)');
          },
          tension: 0.3,
          fill: true,
          pointBackgroundColor: 'rgba(239, 68, 68, 1)',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [dailyData]);
  
  // Line chart options
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
          callback: (value: number) => formatCurrency(value).replace('฿', '')
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
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
    animation: {
      duration: 1000,
    },
  };
  
  // Month comparison chart data
  const comparisonData = useMemo(() => {
    // Get current month data
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    const currentMonthEnd = endOfMonth(today);
    
    // Get previous month data
    const lastMonthDate = subMonths(today, 1);
    const lastMonthStart = startOfMonth(lastMonthDate);
    const lastMonthEnd = endOfMonth(lastMonthDate);
    
    // Filter transactions for current and previous months
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = parseISO(tx.date);
      return isWithinInterval(txDate, { start: currentMonthStart, end: currentMonthEnd });
    });
    
    const lastMonthTransactions = transactions.filter(tx => {
      const txDate = parseISO(tx.date);
      return isWithinInterval(txDate, { start: lastMonthStart, end: lastMonthEnd });
    });
    
    // Calculate totals
    const currentMonthIncome = currentMonthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const currentMonthExpense = currentMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const lastMonthIncome = lastMonthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const lastMonthExpense = lastMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    // Calculate growth percentages
    const incomeGrowth = lastMonthIncome ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 100;
    const expenseGrowth = lastMonthExpense ? ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100 : 100;
    
    // Calculate most changed categories
    const currentMonthExpenseByCategory: Record<string, number> = {};
    const lastMonthExpenseByCategory: Record<string, number> = {};
    
    currentMonthTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        currentMonthExpenseByCategory[tx.category] = (currentMonthExpenseByCategory[tx.category] || 0) + tx.amount;
      });
      
    lastMonthTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        lastMonthExpenseByCategory[tx.category] = (lastMonthExpenseByCategory[tx.category] || 0) + tx.amount;
      });
    
    // Find categories with significant changes
    const categoryChanges: { name: string, change: number, percentage: number }[] = [];
    
    Object.keys({ ...currentMonthExpenseByCategory, ...lastMonthExpenseByCategory }).forEach(category => {
      const current = currentMonthExpenseByCategory[category] || 0;
      const last = lastMonthExpenseByCategory[category] || 0;
      
      if (current === 0 && last === 0) return;
      
      const change = current - last;
      const percentage = last ? (change / last) * 100 : 100;
      
      if (Math.abs(percentage) >= 10) {
        categoryChanges.push({ name: category, change, percentage });
      }
    });
    
    // Sort by absolute percentage change
    categoryChanges.sort((a, b) => Math.abs(b.percentage) - Math.abs(a.percentage));
    
    return {
      months: {
        current: format(today, 'MMMM', { locale: th }),
        last: format(lastMonthDate, 'MMMM', { locale: th }),
      },
      data: {
        currentMonthIncome,
        currentMonthExpense,
        lastMonthIncome,
        lastMonthExpense,
        incomeGrowth,
        expenseGrowth,
      },
      categoryChanges: categoryChanges.slice(0, 3), // Get top 3 most changed categories
      chartData: {
        labels: ['รายรับ', 'รายจ่าย'],
        datasets: [
          {
            label: format(lastMonthDate, 'MMMM', { locale: th }),
            data: [lastMonthIncome, lastMonthExpense],
            backgroundColor: 'rgba(107, 114, 128, 0.7)',
            borderColor: 'rgba(75, 85, 99, 1)',
            borderWidth: 1,
          },
          {
            label: format(today, 'MMMM', { locale: th }),
            data: [currentMonthIncome, currentMonthExpense],
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 1,
          },
        ],
      }
    };
  }, [transactions]);

  // Bar chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: (value: number) => formatCurrency(value).replace('฿', '')
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
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
    animation: {
      duration: 1000,
    },
  };
  
  // Generate insights based on financial data
  const generateInsights = () => {
    const insights = [];
    
    // Check if there's enough data
    if (filteredTransactions.length < 3) {
      insights.push("ยังมีข้อมูลไม่เพียงพอสำหรับคำแนะนำ กรุณาเพิ่มรายการธุรกรรมเพื่อรับคำแนะนำที่ดีขึ้น");
      return insights;
    }
    
    // Check savings rate
    if (savingsRate < 10) {
      insights.push("อัตราการออมของคุณต่ำกว่าที่แนะนำ (10%) ลองพิจารณาลดรายจ่ายที่ไม่จำเป็น");
    } else if (savingsRate > 30) {
      insights.push("อัตราการออมของคุณสูงถึง " + savingsRate.toFixed(0) + "% ซึ่งเป็นเรื่องที่น่ายินดี!");
    }
    
    // Check expense categories
    if (sortedExpenseCategories.length > 0) {
      const topCategory = sortedExpenseCategories[0];
      const topCategoryPercentage = (topCategory[1] / totalExpense) * 100;
      
      if (topCategoryPercentage > 40) {
        insights.push(`รายจ่ายในหมวด ${topCategory[0]} คิดเป็น ${topCategoryPercentage.toFixed(0)}% ของรายจ่ายทั้งหมด ซึ่งค่อนข้างสูง`);
      }
    }
    
    // Compare income vs expense
    if (totalExpense > totalIncome) {
      insights.push("รายจ่ายของคุณสูงกว่ารายได้ในช่วงเวลานี้ ควรพิจารณาปรับแผนการเงิน");
    }
    
    // Month over month changes
    if (timeRange === '30days' || timeRange === 'thisMonth') {
      if (Math.abs(comparisonData.data.expenseGrowth) > 20) {
        const direction = comparisonData.data.expenseGrowth > 0 ? "เพิ่มขึ้น" : "ลดลง";
        insights.push(`รายจ่ายของคุณ${direction} ${Math.abs(comparisonData.data.expenseGrowth).toFixed(0)}% เมื่อเทียบกับเดือนที่แล้ว`);
      }
    }
    
    // Add some general advice if there's room
    if (insights.length < 2) {
      insights.push("การจัดทำงบประมาณและติดตามรายจ่ายอย่างสม่ำเสมอเป็นกุญแจสู่ความสำเร็จทางการเงิน");
    }
    
    return insights;
  };
  
  // Financial insights
  const financialInsights = useMemo(() => generateInsights(), [filteredTransactions.length, savingsRate, totalIncome, totalExpense, sortedExpenseCategories, timeRange, comparisonData]);
  const { currentUser } = useUserStore();

  // Selected chart render
  const renderChart = () => {
    // Loading state
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="h-[320px] flex items-center justify-center p-6">
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="h-[320px] flex items-center justify-center p-6">
              <div className="w-full h-full flex flex-col justify-center space-y-4">
              <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // No data state
    if (filteredTransactions.length === 0) {
      return (
        <Card className="bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center h-[350px] text-center p-6">
            <BarChart3 className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-xl font-medium mb-2">ไม่พบข้อมูลธุรกรรม</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              ยังไม่มีข้อมูลธุรกรรมในช่วงเวลาที่เลือก กรุณาเลือกช่วงเวลาอื่นหรือเพิ่มรายการธุรกรรมใหม่
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มธุรกรรมใหม่
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // Render appropriate chart based on selected type
    switch (chartType) {
      case 'overview':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Summary Cards */}
              <Card className={cn(
                "overflow-hidden",
                "border-t-4 border-t-cyan-500"
              )}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex justify-between">
                    <span>รายรับทั้งหมด</span>
                    <Badge variant="secondary" className="font-normal">
                      <Clock className="mr-1 h-3 w-3" />
                      {getTimeRangeLabel(timeRange)}
                    </Badge>
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-cyan-600">
                    {formatCurrency(totalIncome)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUp className={cn(
                      "mr-1 h-3 w-3",
                      comparisonData.data.incomeGrowth >= 0 ? "text-green-500" : "text-red-500"
                    )} />
                    <span>
                      {Math.abs(comparisonData.data.incomeGrowth).toFixed(1)}%
                      {comparisonData.data.incomeGrowth >= 0 ? " เพิ่มขึ้น" : " ลดลง"}
                      จากเดือนที่แล้ว
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn(
                "overflow-hidden",
                "border-t-4 border-t-orange-500"
              )}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex justify-between">
                    <span>รายจ่ายทั้งหมด</span>
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-600">
                    {formatCurrency(totalExpense)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowDown className={cn(
                      "mr-1 h-3 w-3",
                      comparisonData.data.expenseGrowth <= 0 ? "text-green-500" : "text-red-500"
                    )} />
                    <span>
                      {Math.abs(comparisonData.data.expenseGrowth).toFixed(1)}%
                      {comparisonData.data.expenseGrowth <= 0 ? " ลดลง" : " เพิ่มขึ้น"}
                      จากเดือนที่แล้ว
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn(
                "overflow-hidden",
                totalIncome - totalExpense >= 0 ? "border-t-4 border-t-green-500" : "border-t-4 border-t-red-500"
              )}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex justify-between">
                    <span>ยอดคงเหลือ</span>
                  </CardDescription>
                  <CardTitle className={cn(
                    "text-2xl font-bold",
                    totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(totalIncome - totalExpense)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">อัตราการออม</span>
                      <span className={cn(
                        "font-medium",
                        savingsRate >= 20 ? "text-green-600" : 
                        savingsRate >= 10 ? "text-amber-600" : "text-red-600"
                      )}>
                        {savingsRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(savingsRate, 100)} 
                      className={cn(
                        "h-1.5",
                        savingsRate >= 20 ? "bg-green-600" : 
                        savingsRate >= 10 ? "bg-amber-600" : "bg-red-600"
                      )} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overview Donut Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-primary" />
                    สัดส่วนรายรับ-รายจ่าย
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px] flex items-center justify-center">
                    <Doughnut
                      data={overviewData}
                      options={{
                        maintainAspectRatio: false,
                        cutout: '65%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              usePointStyle: true,
                              boxWidth: 8,
                              padding: 15
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.raw as number || 0;
                                const percentage = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                                const percentageValue = percentage ? Math.round((value / percentage) * 100) : 0;
                                return `${label}: ${formatCurrency(value)} (${percentageValue}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 pt-3">
                  <div className="flex items-center justify-between w-full text-sm">
                    <span className="text-muted-foreground">อัพเดทข้อมูลล่าสุด</span>
                    <span className="font-medium">
                      {format(new Date('2025-03-06 07:51:12'), 'dd MMM yyyy, HH:mm', { locale: th })}
                    </span>
                  </div>
                </CardFooter>
              </Card>

              {/* Financial Insights */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Info className="h-5 w-5 mr-2 text-primary" />
                    คำแนะนำทางการเงิน
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {financialInsights.map((insight, i) => (
                      <div key={i} className="flex">
                        <div className="mr-3 mt-0.5">
                          <div className="bg-primary/10 text-primary p-1 rounded-full">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                    
                    {/* Savings goal */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-sm">เป้าหมายการออม (20%)</h4>
                        <Badge variant={savingsRate >= 20 ? "default" : "outline"}>
                          {savingsRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="bg-muted h-2 rounded-full w-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            savingsRate >= 20 ? "bg-green-500" : 
                            savingsRate >= 10 ? "bg-amber-500" : "bg-red-500"
                          )}
                          style={{ width: `${Math.min(savingsRate * 5, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {savingsRate >= 20 
                          ? "ยินดีด้วย! คุณบรรลุเป้าหมายการออมที่แนะนำ"
                          : `อีก ${(20 - savingsRate).toFixed(1)}% เพื่อบรรลุเป้าหมายการออมที่แนะนำ`
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-muted/30 pt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    ดูรายงานโดยละเอียด
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        );
        
      case 'category':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-red-500" />
                  หมวดหมู่รายจ่าย
                </CardTitle>
                <CardDescription>
                  {getTimeRangeLabel(timeRange)} - รวม {formatCurrency(totalExpense)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {Object.keys(expensesByCategory).length > 0 ? (
                    <Doughnut
                      data={expenseCategoryData}
                      options={doughnutOptions}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <PieChart className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
                      <p className="text-muted-foreground">ไม่มีข้อมูลรายจ่าย</p>
                    </div>
                  )}
                </div>
                
                {/* Top expense categories */}
                {sortedExpenseCategories.length > 0 && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <h4 className="text-sm font-medium">รายจ่ายสูงสุด</h4>
                    {sortedExpenseCategories.map(([category, amount], index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-orange-${500 - (index * 100)}`} />
                          <span className="text-sm">{category}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Income Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Wallet className="h-5 w-5 mr-2 text-cyan-500" />
                  หมวดหมู่รายรับ
                </CardTitle>
                <CardDescription>
                  {getTimeRangeLabel(timeRange)} - รวม {formatCurrency(totalIncome)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {Object.keys(incomesByCategory).length > 0 ? (
                    <Doughnut
                      data={incomeCategoryData}
                      options={doughnutOptions}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <PieChart className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
                      <p className="text-muted-foreground">ไม่มีข้อมูลรายรับ</p>
                    </div>
                  )}
                </div>
                
                {/* Top income categories */}
                {sortedIncomeCategories.length > 0 && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <h4 className="text-sm font-medium">รายรับสูงสุด</h4>
                    {sortedIncomeCategories.map(([category, amount], index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-cyan-${500 - (index * 100)}`} />
                          <span className="text-sm">{category}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      case 'trend':
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-primary" />
                    แนวโน้มรายรับรายจ่าย
                  </CardTitle>
                  <CardDescription>
                    {getTimeRangeLabel(timeRange)}
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>ดาวน์โหลดรายงาน</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <Line data={trendData} options={lineOptions} />
              </div>
              
              {/* Daily stats summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">รายรับเฉลี่ย/วัน</h4>
                    <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold text-cyan-600">
                    {formatCurrency(totalIncome / Math.max(Object.keys(dailyData).length, 1))}
                  </p>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">รายจ่ายเฉลี่ย/วัน</h4>
                    <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(totalExpense / Math.max(Object.keys(dailyData).length, 1))}
                  </p>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">คงเหลือเฉลี่ย/วัน</h4>
                    <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className={cn(
                    "text-lg font-bold",
                    (totalIncome - totalExpense) >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency((totalIncome - totalExpense) / Math.max(Object.keys(dailyData).length, 1))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'comparison':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Main comparison chart - Takes up 3 columns */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  เปรียบเทียบรายเดือน
                </CardTitle>
                <CardDescription>
                  {comparisonData.months.last} เทียบกับ {comparisonData.months.current}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[350px] py-4">
                  <Bar data={comparisonData.chartData} options={barOptions} />
                </div>
              </CardContent>
            </Card>
            
            {/* Comparison metrics - Takes up 2 columns */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">สรุปการเปลี่ยนแปลง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Income change */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-cyan-600" />
                      รายรับ
                    </h4>
                    <Badge 
                      variant={comparisonData.data.incomeGrowth >= 0 ? "default" : "destructive"}
                      className={comparisonData.data.incomeGrowth >= 0 ? "bg-green-600" : undefined}
                    >
                      {comparisonData.data.incomeGrowth >= 0 ? "+" : ""}
                      {comparisonData.data.incomeGrowth.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="text-muted-foreground">{comparisonData.months.last}</p>
                      <p className="font-medium">{formatCurrency(comparisonData.data.lastMonthIncome)}</p>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="flex items-center justify-center">
                        {comparisonData.data.incomeGrowth >= 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">{comparisonData.months.current}</p>
                      <p className="font-medium">{formatCurrency(comparisonData.data.currentMonthIncome)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Expense change */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-orange-600" />
                      รายจ่าย
                    </h4>
                    <Badge 
                      variant={comparisonData.data.expenseGrowth <= 0 ? "default" : "destructive"}
                      className={comparisonData.data.expenseGrowth <= 0 ? "bg-green-600" : undefined}
                    >
                      {comparisonData.data.expenseGrowth <= 0 ? "" : "+"}
                      {comparisonData.data.expenseGrowth.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="text-muted-foreground">{comparisonData.months.last}</p>
                      <p className="font-medium">{formatCurrency(comparisonData.data.lastMonthExpense)}</p>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="flex items-center justify-center">
                        {comparisonData.data.expenseGrowth <= 0 ? (
                          <TrendingDown className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">{comparisonData.months.current}</p>
                      <p className="font-medium">{formatCurrency(comparisonData.data.currentMonthExpense)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Category changes */}
                {comparisonData.categoryChanges.length > 0 && (
                  <div className="pt-4 mt-2 border-t">
                    <h4 className="text-sm font-medium mb-3">การเปลี่ยนแปลงหมวดหมู่ที่สำคัญ</h4>
                    <div className="space-y-3">
                      {comparisonData.categoryChanges.map((category, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center">
                            {category.change > 0 ? (
                              <ArrowUp className="h-4 w-4 mr-1.5 text-red-500" />
                            ) : (
                              <ArrowDown className="h-4 w-4 mr-1.5 text-green-500" />
                            )}
                            <span className="text-sm truncate max-w-[150px]">{category.name}</span>
                          </div>
                          <div>
                            <Badge 
                              variant={category.change <= 0 ? "outline" : "destructive"}
                              className={cn(
                                "whitespace-nowrap",
                                category.change <= 0 && "text-green-600 border-green-200 bg-green-50"
                              )}
                            >
                              {category.change >= 0 ? "+" : ""}
                              {category.percentage.toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/10 rounded-b-lg border-t pt-3">
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  อัปเดตข้อมูลล่าสุด
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            รายงานทางการเงิน
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            แสดงข้อมูลธุรกรรมของ {currentUser?.name} ณ วันที่ {format(new Date('2025-03-06'), 'd MMMM yyyy', { locale: th })}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview" className="text-xs">
                <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                ภาพรวม
              </TabsTrigger>
              <TabsTrigger value="category" className="text-xs">
                <PieChart className="h-3.5 w-3.5 mr-1.5" />
                หมวดหมู่
              </TabsTrigger>
              <TabsTrigger value="trend" className="text-xs">
                <LineChart className="h-3.5 w-3.5 mr-1.5" />
                แนวโน้ม
              </TabsTrigger>
              <TabsTrigger value="comparison" className="text-xs">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                เปรียบเทียบ
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
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
      
      {/* Main Chart Content */}
      {renderChart()}
      
      {/* Footer with data insights */}
      <Card className="bg-muted/20 border-dashed mt-6">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Info className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              ข้อมูลอัพเดทล่าสุด: {format(new Date('2025-03-06 07:53:55'), 'dd MMM yyyy, HH:mm:ss', { locale: th })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              ผู้ใช้: {currentUser?.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setShowInsights(!showInsights)}
            >
              <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
              คำอธิบายรายงาน
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              ดาวน์โหลด
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Report explanation popover */}
      <Popover open={showInsights} onOpenChange={setShowInsights}>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <h3 className="font-medium">คำอธิบายรายงาน</h3>
            <div className="space-y-1 text-sm">
              <p className="flex items-start">
                <LayoutDashboard className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span><b>ภาพรวม</b>: แสดงสรุปรายรับ-รายจ่าย และอัตราการออม</span>
              </p>
              <p className="flex items-start">
                <PieChart className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span><b>หมวดหมู่</b>: แสดงสัดส่วนรายรับ-รายจ่ายตามหมวดหมู่</span>
              </p>
              <p className="flex items-start">
                <LineChart className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span><b>แนวโน้ม</b>: แสดงรายรับ-รายจ่ายตามช่วงเวลา</span>
              </p>
              <p className="flex items-start">
                <BarChart3 className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span><b>เปรียบเทียบ</b>: แสดงการเปรียบเทียบกับเดือนก่อนหน้า</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              คุณสามารถปรับเปลี่ยนช่วงเวลาที่ต้องการดูข้อมูลได้จากเมนูด้านบน
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}