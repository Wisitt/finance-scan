/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { parseISO, format, isToday, isYesterday, isSameWeek, isSameMonth } from 'date-fns';
import { useTransactionStore } from '@/store/transactionStore';
import { cn } from '@/lib/utils';

// UI Components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Icons
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Search,
  Image as ImageIcon,
  X,
  Filter,
  CalendarDays,
  Download,
  CreditCard,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  RefreshCw,
  Plus,
  FileText,
  Calendar,
  SlidersHorizontal,
  Tag
} from 'lucide-react';

import toast from 'react-hot-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

type FilterType = 'all' | 'income' | 'expense';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
type DateRangeOption = 'all' | 'today' | 'week' | 'month' | 'custom';

// Thai Date Formatting
const formatThaiMonth = (date: Date): string => {
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  
  return `${day} ${month} ${year}`;
};

const formatThaiShortDate = (date: Date): string => {
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  
  return `${day} ${month} ${year.toString().substring(2)}`;
};

interface TransactionGroup {
  title: string;
  date: Date;
  transactions: any[];
}

export default function TransactionList() {
  const { transactions, deleteTransaction } = useTransactionStore();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Get current date & time for displaying
  const currentDate = new Date('2025-03-06 08:00:22');
  const currentUser = 'Wisitt';
  
  // Pagination settings
  const itemsPerPage = 10;
  
  useEffect(() => {
    // Simulate loading state
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [filterType, searchTerm, dateRange, sortOption, categoryFilter]);
  
  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = transactions.map(tx => tx.category);
    return ['all', ...Array.from(new Set(cats))];
  }, [transactions]);
  
  // Format currency consistently
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Filter and sort transactions based on selected options
  const processedTransactions = useMemo(() => {
    // Apply filters
    const result = transactions.filter(tx => {
      // Type filter
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }
      
      // Category filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          tx.category.toLowerCase().includes(searchLower) ||
          (tx.description && tx.description.toLowerCase().includes(searchLower))
        );
      }
      
      // Date range filter
      if (dateRange !== 'all') {
        const txDate = parseISO(tx.date);
        const today = new Date();
        
        switch (dateRange) {
          case 'today':
            return isToday(txDate);
          case 'week':
            return isSameWeek(txDate, today);
          case 'month':
            return isSameMonth(txDate, today);
          default:
            return true;
        }
      }
      
      return true;
    });
    
    // Apply sorting
    result.sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      
      switch (sortOption) {
        case 'newest':
          return dateB.getTime() - dateA.getTime();
        case 'oldest':
          return dateA.getTime() - dateB.getTime();
        case 'highest':
          return b.amount - a.amount;
        case 'lowest':
          return a.amount - b.amount;
        default:
          return dateB.getTime() - dateA.getTime();
      }
    });
    
    return result;
  }, [transactions, filterType, searchTerm, dateRange, sortOption, categoryFilter]);
  
  // // Group transactions by date
  // const groupedTransactions = useMemo(() => {
  //   const groups: TransactionGroup[] = [];
  //   const today = new Date();
    
  //   processedTransactions.forEach(tx => {
  //     const txDate = parseISO(tx.date);
      
  //     let groupTitle = '';
      
  //     if (isToday(txDate)) {
  //       groupTitle = 'วันนี้';
  //     } else if (isYesterday(txDate)) {
  //       groupTitle = 'เมื่อวาน';
  //     } else if (isSameWeek(txDate, today, { weekStartsOn: 1 })) {
  //       groupTitle = 'สัปดาห์นี้';
  //     } else if (isSameMonth(txDate, today)) {
  //       groupTitle = 'เดือนนี้';
  //     } else {
  //       groupTitle = format(txDate, 'MMMM yyyy');
  //     }
      
  //     const existingGroup = groups.find(g => g.title === groupTitle);
      
  //     if (existingGroup) {
  //       existingGroup.transactions.push(tx);
  //     } else {
  //       groups.push({
  //         title: groupTitle,
  //         date: txDate,
  //         transactions: [tx]
  //       });
  //     }
  //   });
    
  //   // Sort groups by date (newest first)
  //   groups.sort((a, b) => b.date.getTime() - a.date.getTime());
    
  //   return groups;
  // }, [processedTransactions]);
  
  // Handle pagination
  const paginatedTransactionGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    const allTransactions = processedTransactions;
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
    
    // Re-group the paginated transactions
    const groups: TransactionGroup[] = [];
    const today = new Date();
    
    paginatedTransactions.forEach(tx => {
      const txDate = parseISO(tx.date);
      
      let groupTitle = '';
      
      if (isToday(txDate)) {
        groupTitle = 'วันนี้';
      } else if (isYesterday(txDate)) {
        groupTitle = 'เมื่อวาน';
      } else if (isSameWeek(txDate, today, { weekStartsOn: 1 })) {
        groupTitle = 'สัปดาห์นี้';
      } else if (isSameMonth(txDate, today)) {
        groupTitle = 'เดือนนี้';
      } else {
        groupTitle = format(txDate, 'MMMM yyyy');
      }
      
      const existingGroup = groups.find(g => g.title === groupTitle);
      
      if (existingGroup) {
        existingGroup.transactions.push(tx);
      } else {
        groups.push({
          title: groupTitle,
          date: txDate,
          transactions: [tx]
        });
      }
    });
    
    // Sort groups by date (newest first)
    groups.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return {
      groups,
      totalPages: Math.ceil(allTransactions.length / itemsPerPage),
      totalItems: allTransactions.length
    };
  }, [processedTransactions, currentPage, itemsPerPage]);
  
  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalIncome = processedTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalExpense = processedTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    return { totalIncome, totalExpense, balance };
  }, [processedTransactions]);
  
  const viewReceipt = (imageUrl: string) => {
    setShowImageModal(imageUrl);
  };
  
  const viewTransactionDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast.success('รายการถูกลบเรียบร้อยแล้ว');
    } catch {
      toast.error('ไม่สามารถลบรายการได้');
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilterType('all');
    setSearchTerm('');
    setDateRange('all');
    setSortOption('newest');
    setCategoryFilter('all');
  };
  
  // Render transaction card - reusable component
  const renderTransactionCard = (transaction: any) => (
    <div
      key={transaction.id}
      className={cn(
        "relative flex items-center justify-between p-4 rounded-lg border transition-colors",
        "hover:bg-muted/30 focus-within:bg-muted/30 focus-within:ring-1 focus-within:ring-primary",
      )}
    >
      {/* Type indicator line */}
      <div 
        className={cn(
          "absolute left-0 top-0 w-1 h-full rounded-l-lg",
          transaction.type === 'income' ? "bg-green-500" : "bg-red-500"
        )}
      />
      
      <div className="flex items-start space-x-3 pl-2">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full",
          transaction.type === 'income' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        )}>
          {transaction.type === 'income' ? (
            <ArrowUpCircle className="h-5 w-5" />
          ) : (
            <ArrowDownCircle className="h-5 w-5" />
          )}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <p className="font-medium">{transaction.category}</p>
            {transaction.receipt_images && transaction.receipt_images.length > 0 && (
              <Badge variant="outline" className="text-xs flex items-center gap-1 px-1.5 py-0.5">
                <ImageIcon className="h-3 w-3" />
                <span>ใบเสร็จ</span>
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatThaiShortDate(parseISO(transaction.date))}
          </p>
          {transaction.description && (
            <p className="text-sm text-foreground/80 mt-1 max-w-[300px] truncate">{transaction.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <p className={cn(
          "font-medium text-base",
          transaction.type === 'income' ? "text-green-600" : "text-red-600"
        )}>
          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
        </p>
        
        <div className="flex items-center space-x-1">
          {transaction.receipt_images && transaction.receipt_images.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={() => viewReceipt(transaction.receipt_images![0])}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted"
            onClick={() => viewTransactionDetails(transaction)}
          >
            <Info className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground rounded-full hover:bg-red-50 hover:text-red-500"
            onClick={() => setDeleteId(transaction.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center">
          <FileText className="mr-2 h-6 w-6 text-primary" />
          รายการธุรกรรมทั้งหมด
        </h2>
        
        <div className="flex items-center gap-2 self-end">
          <Badge variant="outline" className="font-normal">
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            {format(currentDate, 'dd MMM yyyy')}
          </Badge>
          
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            ส่งออก
          </Button>
          
          <Button size="sm" onClick={() => setMobileFiltersOpen(true)} className="md:hidden">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            ตัวกรอง
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-muted/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">รายรับทั้งหมด</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">รายจ่ายทั้งหมด</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalExpense)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ยอดคงเหลือ</p>
                <p className={cn(
                  "text-2xl font-bold",
                  summary.balance >= 0 ? "text-primary" : "text-red-600"
                )}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                summary.balance >= 0 ? "bg-primary/10" : "bg-red-100"
              )}>
                <ArrowUpCircle className={cn(
                  "h-5 w-5",
                  summary.balance >= 0 ? "text-primary" : "text-red-600"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Card with Filters and Transaction List */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>รายการธุรกรรม</CardTitle>
              <CardDescription>
                {isLoading ? (
                  <Skeleton className="h-4 w-40 mt-1" />
                ) : (
                  `ทั้งหมด ${processedTransactions.length} รายการ`
                )}
              </CardDescription>
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหารายการ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                    ตัวกรอง
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {(
                        (filterType !== 'all' ? 1 : 0) +
                        (dateRange !== 'all' ? 1 : 0) +
                        (categoryFilter !== 'all' ? 1 : 0)
                      )}
                    </Badge>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-4" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium">ตัวกรอง</h4>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">ประเภทธุรกรรม</h5>
                      <Tabs 
                        value={filterType} 
                        onValueChange={(value) => setFilterType(value as FilterType)}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                          <TabsTrigger 
                            value="income" 
                            className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600"
                          >
                            รายรับ
                          </TabsTrigger>
                          <TabsTrigger 
                            value="expense" 
                            className="data-[state=active]:bg-red-50 data-[state=active]:text-red-600"
                          >
                            รายจ่าย
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">ช่วงเวลา</h5>
                      <Select
                        value={dateRange}
                        onValueChange={(value) => setDateRange(value as DateRangeOption)}
                      >
                        <SelectTrigger>
                          <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="เลือกช่วงเวลา" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">ทั้งหมด</SelectItem>
                          <SelectItem value="today">วันนี้</SelectItem>
                          <SelectItem value="week">สัปดาห์นี้</SelectItem>
                          <SelectItem value="month">เดือนนี้</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">หมวดหมู่</h5>
                      <Select
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
                      >
                        <SelectTrigger>
                          <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="เลือกหมวดหมู่" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat === 'all' ? 'ทั้งหมด' : cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="pt-2 flex justify-between">
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        รีเซ็ต
                      </Button>
                      <Button size="sm">
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        ใช้ตัวกรอง
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Select
                value={sortOption}
                onValueChange={(value) => setSortOption(value as SortOption)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="เรียงลำดับ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">ล่าสุดก่อน</SelectItem>
                  <SelectItem value="oldest">เก่าสุดก่อน</SelectItem>
                  <SelectItem value="highest">ยอดสูงสุดก่อน</SelectItem>
                  <SelectItem value="lowest">ยอดต่ำสุดก่อน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Mobile Search */}
            <div className="relative md:hidden w-full">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหารายการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
        </CardHeader>
        
        <Separator />
        
        {/* Transaction Content */}
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : processedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-medium mb-2">ไม่พบรายการธุรกรรม</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหาของคุณ ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" onClick={resetFilters}>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  รีเซ็ตตัวกรอง
                </Button>
                <Button>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  เพิ่มธุรกรรมใหม่
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <ScrollArea className="max-h-[600px]">
                <div className="p-4 space-y-6">
                {paginatedTransactionGroups.groups.map((group, index) => (
                    <div key={index} className="space-y-3">
                      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm py-2">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                          <CalendarDays className="h-4 w-4 mr-1.5" />
                          {group.title}
                        </h3>
                      </div>
                      
                      <div className="space-y-2">
                        {group.transactions.map((transaction) => renderTransactionCard(transaction))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination summary */}
                  <div className="pt-4 text-center text-sm text-muted-foreground">
                    แสดงรายการ {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, processedTransactions.length)} จาก {processedTransactions.length} รายการ
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
        
        {/* Card Footer with Pagination */}
        {!isLoading && processedTransactions.length > 0 && (
          <CardFooter className="border-t p-4 flex-col sm:flex-row gap-3">
            <div className="flex-1 text-xs text-muted-foreground">
              อัปเดตล่าสุด: {format(new Date('2025-03-06 08:04:14'), 'dd MMM yyyy, HH:mm:ss')}
            </div>
            
            {paginatedTransactionGroups.totalPages > 1 && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: paginatedTransactionGroups.totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0",
                      currentPage === i + 1 && "font-bold"
                    )}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage >= paginatedTransactionGroups.totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(paginatedTransactionGroups.totalPages, prev + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
      
      {/* Receipt Modal */}
      <Dialog open={!!showImageModal} onOpenChange={() => setShowImageModal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between">
              <span>ใบเสร็จ</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowImageModal(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {showImageModal && (
            <div className="flex justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={showImageModal} 
                alt="Receipt" 
                className="max-h-[70vh] object-contain rounded-md" 
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowImageModal(null)} variant="outline" className="mr-auto">
              ปิด
            </Button>
            <Button>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              ดาวน์โหลด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>รายละเอียดธุรกรรม</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium",
                  selectedTransaction.type === 'income'
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                )}>
                  {selectedTransaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                </div>
                <p className={cn(
                  "text-lg font-bold",
                  selectedTransaction.type === 'income' ? "text-green-600" : "text-red-600"
                )}>
                  {selectedTransaction.type === 'income' ? '+' : '-'} {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">วันที่</p>
                  <p className="font-medium">{formatThaiMonth(parseISO(selectedTransaction.date))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">หมวดหมู่</p>
                  <p className="font-medium">{selectedTransaction.category}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">รายละเอียด</p>
                  <p className="font-medium">{selectedTransaction.description || "-"}</p>
                </div>
                
                {selectedTransaction.receipt_images && selectedTransaction.receipt_images.length > 0 && (
                  <div className="col-span-2 space-y-2">
                    <p className="text-sm text-muted-foreground">ใบเสร็จ</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedTransaction.receipt_images.map((img: string, idx: number) => (
                        <div key={idx} className="relative h-20 w-20 rounded-md overflow-hidden border hover:opacity-80 cursor-pointer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`Receipt ${idx + 1}`}
                            className="object-cover w-full h-full"
                            onClick={() => viewReceipt(img)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <p>ID: {selectedTransaction.id.substring(0, 8)}...</p>
                <p>รายการโดย: {currentUser}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSelectedTransaction(null)}
            >
              ปิด
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                setDeleteId(selectedTransaction.id);
                setSelectedTransaction(null);
              }}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              ลบรายการ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบรายการ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบรายการนี้ใช่หรือไม่? การลบรายการจะไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteId) {
                  handleDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              ลบรายการ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Mobile Filters Dialog */}
      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ตัวกรองรายการ</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <h5 className="text-sm font-medium">ประเภทธุรกรรม</h5>
              <Tabs 
                value={filterType} 
                onValueChange={(value) => setFilterType(value as FilterType)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                  <TabsTrigger 
                    value="income" 
                    className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600"
                  >
                    รายรับ
                  </TabsTrigger>
                  <TabsTrigger 
                    value="expense" 
                    className="data-[state=active]:bg-red-50 data-[state=active]:text-red-600"
                  >
                    รายจ่าย
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-sm font-medium">ช่วงเวลา</h5>
              <Select
                value={dateRange}
                onValueChange={(value) => setDateRange(value as DateRangeOption)}
              >
                <SelectTrigger>
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="เลือกช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="today">วันนี้</SelectItem>
                  <SelectItem value="week">สัปดาห์นี้</SelectItem>
                  <SelectItem value="month">เดือนนี้</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-sm font-medium">หมวดหมู่</h5>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'ทั้งหมด' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-sm font-medium">การเรียงลำดับ</h5>
              <Select
                value={sortOption}
                onValueChange={(value) => setSortOption(value as SortOption)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เรียงลำดับ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">ล่าสุดก่อน</SelectItem>
                  <SelectItem value="oldest">เก่าสุดก่อน</SelectItem>
                  <SelectItem value="highest">ยอดสูงสุดก่อน</SelectItem>
                  <SelectItem value="lowest">ยอดต่ำสุดก่อน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={resetFilters} className="flex-1">
              รีเซ็ตตัวกรอง
            </Button>
            <Button onClick={() => setMobileFiltersOpen(false)} className="flex-1">
              <Check className="mr-1.5 h-3.5 w-3.5" />
              ใช้ตัวกรอง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}