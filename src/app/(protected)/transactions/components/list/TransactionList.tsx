'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTransactionStore } from '@/store/transactionStore';
import { Transaction } from '@/types';

// Components


// UI
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';

// Icons
import { Calendar, Download, FileText, ChevronLeft, ChevronRight, CreditCard, ArrowUpCircle, Wallet } from 'lucide-react';
import { exportTransactionsToCSV } from './exportTransactionsToCSV';
import TransactionDetailModal from './TransactionDetailModal';
import TransactionFilters from './TransactionFilters';
import TransactionListSkeleton from './TransactionListSkeleton';
import TransactionTable from './TransactionTable';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ImageModal } from '@/components/shared/ImageModal';
import { SummaryCard } from '@/components/shared/SummaryCard';
import EmptyState from '@/components/shared/EmptyState';

// Utils


export default function TransactionList() {
  const { user } = useAuthUser();
  const { transactions, loading: transactionsLoading, deleteTransaction } = useTransactionStore();
  
  // State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Filters and pagination
  const {
    filters,
    updateFilter,
    resetFilters,
    processedTransactions,
    uniqueCategories,
    summary,
  } = useTransactionFilters(transactions);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Reset currentPage when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination logic
  const totalItems = processedTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = useMemo(() => {
    return processedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedTransactions, startIndex]);

  // Handle delete
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

  // Handle CSV export
  const handleExportCSV = () => {
    if (!processedTransactions.length) {
      toast.error('ไม่มีข้อมูลที่จะส่งออก');
      return;
    }
    
    exportTransactionsToCSV(processedTransactions);
    toast.success('ส่งออกข้อมูลสำเร็จ');
  };

  // Loading state
  if (transactionsLoading) {
    return <TransactionListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            ส่งออก
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
        <SummaryCard
        title="รายรับทั้งหมด"
        value={summary.totalIncome}
        icon={Wallet}
        color="text-green-600"
        bgColor="bg-green-100"
        />

        <SummaryCard
        title="รายจ่ายทั้งหมด"
        value={summary.totalExpense}
        icon={CreditCard}
        color="text-red-600"
        bgColor="bg-red-100"
        />

        <SummaryCard
        title="ยอดคงเหลือ"
        value={summary.balance}
        icon={ArrowUpCircle}
        color={summary.balance >= 0 ? 'text-primary' : 'text-red-600'}
        bgColor={summary.balance >= 0 ? 'bg-primary/10' : 'bg-red-100'}
        />

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle>รายการธุรกรรม</CardTitle>
              <CardDescription>
                ทั้งหมด {processedTransactions.length} รายการ
              </CardDescription>
            </div>
            
            <TransactionFilters 
              filters={filters}
              updateFilter={updateFilter}
              resetFilters={resetFilters}
              uniqueCategories={uniqueCategories}
            />
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="p-4">
          {!processedTransactions.length ? (
            <EmptyState 
                title='ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหาของคุณ ลองเปลี่ยนตัวกรองหรือคำค้นหา' 
                message='ไม่พบรายการธุรกรรม' />
          ) : (
            <TransactionTable 
              transactions={currentTransactions} 
              onViewDetails={setSelectedTransaction}
              onViewImage={setShowImageModal}
              onDeleteClick={setDeleteId}
            />
          )}
        </CardContent>
        
        {processedTransactions.length > 0 && (
          <CardFooter className="border-t p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="text-xs text-muted-foreground">
              แสดง {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} จากทั้งหมด{' '}
              {totalItems} รายการ
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <ImageModal 
        imageUrl={showImageModal} 
        isOpen={!!showImageModal}
        onClose={() => setShowImageModal(null)}
      />
      
      <TransactionDetailModal 
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onDelete={(id) => {
          setDeleteId(id);
          setSelectedTransaction(null);
        }}
        username={user?.name}
      />
      
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="ยืนยันการลบรายการ"
        description="การลบจะไม่สามารถย้อนกลับได้"
        confirmText="ลบรายการ"
        />
    </div>
  );
}