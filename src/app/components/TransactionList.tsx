/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo } from 'react';
import { parseISO, format, isToday, isSameWeek, isSameMonth } from 'date-fns';
import { useAuthUser } from '@/hook/useAuthUser';
import { useTransactionStore } from '@/store/transactionStore';
import toast from 'react-hot-toast';

// UI Components (shadcn)
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Search,
  Image as ImageIcon,
  X,
  Filter,
  Download,
  CreditCard,
  Wallet,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

type FilterType = 'all' | 'income' | 'expense';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
type DateRangeOption = 'all' | 'today' | 'week' | 'month';

interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  amount: number;
  receipt_images?: string[];
}

// Helper: Format currency (บาท)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Helper: Format date เป็นรูปแบบ dd MMM yyyy (เช่น 08 มี.ค. 2025)
const formatDate = (dateString: string) => {
  const date = parseISO(dateString);
  return format(date, 'dd MMM yyyy');
};

export default function TransactionList() {
  const { user } = useAuthUser();
  const {
    transactions,
    loading: transactionsLoading,
    deleteTransaction
  } = useTransactionStore();

  // ฟิลเตอร์
  const [filters, setFilters] = useState<{
    type: FilterType;
    category: string;
    dateRange: DateRangeOption;
    sortOption: SortOption;
    searchTerm: string;
  }>({
    type: 'all',
    category: 'all',
    dateRange: 'all',
    sortOption: 'newest',
    searchTerm: ''
  });

  // จัดการหน้าปัจจุบันสำหรับแบ่งหน้า
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // สถานะเปิด/ปิด Dialog ต่าง ๆ
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // ดึงค่า category ทั้งหมดจากรายการที่มี
  const uniqueCategories = useMemo(() => {
    if (!transactions.length) return ['all'];
    const distinct = Array.from(new Set(transactions.map(tx => tx.category)));
    return ['all', ...distinct];
  }, [transactions]);

  // ฟังก์ชันอัปเดตฟิลเตอร์
  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // ฟังก์ชันรีเซ็ตฟิลเตอร์
  const resetFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      dateRange: 'all',
      sortOption: 'newest',
      searchTerm: ''
    });
    setCurrentPage(1);
  };

  const processedTransactions = useMemo(() => {
    if (!transactions.length) return [];
    const { type, category, dateRange, sortOption, searchTerm } = filters;
    const filtered = transactions.filter(tx => {
      // filter type
      if (type !== 'all' && tx.type !== type) return false;
      // filter category
      if (category !== 'all' && tx.category !== category) return false;
      // search
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const inCat = tx.category.toLowerCase().includes(lowerSearch);
        const inDesc = tx.description?.toLowerCase().includes(lowerSearch);
        if (!inCat && !inDesc) return false;
      }
      // date range
      const txDate = parseISO(tx.date);
      const today = new Date();
      if (dateRange === 'today' && !isToday(txDate)) return false;
      if (dateRange === 'week' && !isSameWeek(txDate, today)) return false;
      if (dateRange === 'month' && !isSameMonth(txDate, today)) return false;
      return true;
    });

    // เรียงลำดับ
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
    }

    return filtered;
  }, [transactions, filters]);

  // คำนวน Summary
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    processedTransactions.forEach(tx => {
      if (tx.type === 'income') totalIncome += tx.amount;
      else totalExpense += tx.amount;
    });
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [processedTransactions]);

  // แบ่งหน้า
  const totalItems = processedTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = useMemo(() => {
    return processedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedTransactions, startIndex, itemsPerPage]);

  // ลบรายการ
  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast.success('ลบรายการสำเร็จ');
      setDeleteId(null);
      setSelectedTransaction(null);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบรายการ');
      console.error(error);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (!processedTransactions.length) {
      toast.error('ไม่มีข้อมูลที่จะส่งออก');
      return;
    }
    const header = 'วันที่,ประเภท,หมวดหมู่,รายละเอียด,จำนวนเงิน\n';
    const rows = processedTransactions
      .map(tx => {
        const date = format(parseISO(tx.date), 'yyyy-MM-dd');
        const type = tx.type === 'income' ? 'รายรับ' : 'รายจ่าย';
        const desc = tx.description?.replace(/"/g, '""') || '';
        const cat = tx.category.replace(/"/g, '""');
        return `${date},${type},"${cat}","${desc}",${tx.amount}`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('ส่งออกข้อมูลสำเร็จ');
  };

  // Loading Skeleton (ถ้ากำลังโหลด)
  if (transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-muted/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <Separator />
          <CardContent className="p-6 space-y-4">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ส่วนหัว + ปุ่มต่าง ๆ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center">
          <FileText className="mr-2 h-6 w-6 text-primary" />
          รายการธุรกรรมทั้งหมด
        </h2>
        <div className="flex items-center flex-wrap gap-2">
          <Badge variant="outline" className="font-normal">
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            {format(new Date(), 'dd MMM yyyy')}
          </Badge>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            ส่งออก
          </Button>
        </div>
      </div>

      {/* สรุปรายรับ-รายจ่าย-ยอดคงเหลือ */}
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
                <p
                  className={cn(
                    'text-2xl font-bold',
                    summary.balance >= 0 ? 'text-primary' : 'text-red-600'
                  )}
                >
                  {formatCurrency(summary.balance)}
                </p>
              </div>
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center',
                  summary.balance >= 0 ? 'bg-primary/10' : 'bg-red-100'
                )}
              >
                <ArrowUpCircle
                  className={cn(
                    'h-5 w-5',
                    summary.balance >= 0 ? 'text-primary' : 'text-red-600'
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* บล็อกหลัก แสดงฟิลเตอร์ + ตารางรายการธุรกรรม */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>รายการธุรกรรม</CardTitle>
              <CardDescription>
                ทั้งหมด {processedTransactions.length} รายการ
              </CardDescription>
            </div>

            {/* ส่วนฟิลเตอร์ (แสดงตลอด) */}
            <div className="flex flex-wrap items-center gap-2">
              {/* ช่องค้นหา */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหารายการ..."
                  className="pl-8 w-40"
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                />
              </div>

              {/* ประเภท (รายรับ/รายจ่าย) */}
              <Select
                value={filters.type}
                onValueChange={(value) => updateFilter('type', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="ประเภทธุรกรรม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="income">รายรับ</SelectItem>
                  <SelectItem value="expense">รายจ่าย</SelectItem>
                </SelectContent>
              </Select>

              {/* หมวดหมู่ */}
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilter('category', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="หมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'ทั้งหมด' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ช่วงเวลา */}
              <Select
                value={filters.dateRange}
                onValueChange={(value) => updateFilter('dateRange', value)}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="ช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="today">วันนี้</SelectItem>
                  <SelectItem value="week">สัปดาห์นี้</SelectItem>
                  <SelectItem value="month">เดือนนี้</SelectItem>
                </SelectContent>
              </Select>

              {/* เรียงลำดับ */}
              <Select
                value={filters.sortOption}
                onValueChange={(value) => updateFilter('sortOption', value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="เรียงลำดับ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">ล่าสุดก่อน</SelectItem>
                  <SelectItem value="oldest">เก่าสุดก่อน</SelectItem>
                  <SelectItem value="highest">ยอดสูงสุดก่อน</SelectItem>
                  <SelectItem value="lowest">ยอดต่ำสุดก่อน</SelectItem>
                </SelectContent>
              </Select>

              {/* ปุ่มรีเซ็ต */}
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                รีเซ็ต
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator />

        {/* ส่วนแสดงรายการธุรกรรม */}
        <CardContent className="p-4">
          {!processedTransactions.length ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-medium mb-2">ไม่พบรายการธุรกรรม</h3>
              <p className="text-muted-foreground max-w-md">
                ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหาของคุณ ลองเปลี่ยนตัวกรองหรือคำค้นหา
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentTransactions.map(tx => (
                <div
                  key={tx.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-colors',
                    'hover:bg-muted/30 focus-within:bg-muted/30 focus-within:ring-1 focus-within:ring-primary'
                  )}
                >
                  {/* แถบสีด้านซ้าย (indicater ประเภท) */}
                  <div
                    className={cn(
                      'absolute left-[-9999px]', // ซ่อนด้วยวิธีนี้เพื่อลดความซับซ้อน (หรือจะใช้ before: ได้)
                      'sm:static sm:w-1 sm:h-full sm:rounded-l-lg',
                      tx.type === 'income' ? 'sm:bg-green-500' : 'sm:bg-red-500'
                    )}
                  />
                  {/* ส่วนข้อมูลซ้าย */}
                  <div className="flex-1 sm:ml-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full',
                          tx.type === 'income'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        )}
                      >
                        {tx.type === 'income' ? (
                          <ArrowUpCircle className="h-4 w-4" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4" />
                        )}
                      </div>
                      <p className="font-medium">
                        {tx.category}
                      </p>
                      {tx.receipt_images && tx.receipt_images.length > 0 && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1 px-1.5 py-0.5">
                          <ImageIcon className="h-3 w-3" />
                          <span>ใบเสร็จ</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tx.date)}
                    </p>
                    {tx.description && (
                      <p className="text-sm mt-1 max-w-[300px] truncate">
                        {tx.description}
                      </p>
                    )}
                  </div>

                  {/* ส่วนข้อมูลขวา */}
                  <div className="mt-3 sm:mt-0 flex items-center gap-3">
                    <span
                      className={cn(
                        'font-medium text-base',
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      {tx.receipt_images && tx.receipt_images.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-muted"
                          onClick={() => setShowImageModal(tx.receipt_images![0])}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted"
                        onClick={() => setSelectedTransaction}
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground rounded-full hover:bg-red-50 hover:text-red-500"
                        onClick={() => setDeleteId(tx.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* ส่วนแสดง pagination */}
        {processedTransactions.length > 0 && (
          <CardFooter className="border-t p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="text-xs text-muted-foreground">
              แสดง {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} จากทั้งหมด {totalItems} รายการ
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                หน้า {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Dialog: ดูใบเสร็จ */}
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
            <Button variant="outline" onClick={() => setShowImageModal(null)}>
              ปิด
            </Button>
            {showImageModal && (
              <Button asChild>
                <a href={showImageModal} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  ดาวน์โหลด
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: รายละเอียดธุรกรรม */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>รายละเอียดธุรกรรม</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium',
                    selectedTransaction.type === 'income'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  )}
                >
                  {selectedTransaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                </div>
                <p
                  className={cn(
                    'text-lg font-bold',
                    selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {selectedTransaction.type === 'income' ? '+' : '-'}{' '}
                  {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">วันที่</p>
                  <p className="font-medium">{formatDate(selectedTransaction.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">หมวดหมู่</p>
                  <p className="font-medium">{selectedTransaction.category}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">รายละเอียด</p>
                  <p className="font-medium">{selectedTransaction.description || '-'}</p>
                </div>
                {selectedTransaction.receipt_images && selectedTransaction.receipt_images.length > 0 && (
                  <div className="col-span-2 space-y-2">
                    <p className="text-sm text-muted-foreground">ใบเสร็จ</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedTransaction.receipt_images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative h-20 w-20 rounded-md overflow-hidden border hover:opacity-80 cursor-pointer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`Receipt ${idx + 1}`}
                            className="object-cover w-full h-full"
                            onClick={() => setShowImageModal(img)}
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
                <p>รายการโดย: {user?.name || 'ไม่ระบุ'}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
              ปิด
            </Button>
            {selectedTransaction && (
              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteId(selectedTransaction.id);
                  setSelectedTransaction(null);
                }}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                ลบรายการ
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: ยืนยันลบ */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบรายการ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบรายการนี้ใช่หรือไม่? การลบแล้วจะไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  handleDelete(deleteId);
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
    </div>
  );
}
