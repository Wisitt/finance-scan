'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTransactionStore } from '@/store/transactionStore';
import { Transaction } from '@/types';
import { format } from 'date-fns';

// UI Components
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
import { toast } from 'sonner';
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
  Filter,
} from 'lucide-react';

// Components

import { TransactionFilters } from './TransactionFilters';

import { TransactionListSkeleton } from './TransactionListSkeleton';

// Hooks and Utilities
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { exportTransactionsToCSV, exportTransactionsToJSON } from '@/utils/exportUtils';

import { EmptyState } from '@/components/shared/EmptyState';
import { TransactionDetailModal } from '@/components/ui/transaction-detail-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ImageModal } from '@/components/ui/image-modal';
import TransactionTable from './TransactionTable';

interface TransactionListProps {
  showFilters?: boolean;
  showExport?: boolean;
  showHeader?: boolean;
  limitCount?: number;
}

export function TransactionList({
  showFilters = true,
  showHeader = true,
  limitCount,
}: TransactionListProps) {
  const { user } = useAuthUser();
  const { transactions, loading: transactionsLoading, deleteTransaction } = useTransactionStore();
  
  // State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Filters and pagination
  const {
    filters,
    updateFilter,
    resetFilters,
    processedTransactions,
    uniqueCategories,
    summary,
    activeFilterCount
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
  
  // Apply limit if specified
  const displayedTransactions = useMemo(() => {
    let results = processedTransactions.slice(startIndex, startIndex + itemsPerPage);
    if (limitCount && limitCount > 0) {
      results = results.slice(0, limitCount);
    }
    return results;
  }, [processedTransactions, startIndex, limitCount, itemsPerPage]);

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast.success('ลบรายการสำเร็จ');
      setDeleteId(null);
      setSelectedTransaction(null);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบรายการ', {
        description: 'โปรดลองอีกครั้งในภายหลัง',
      });
      console.error(error);
    }
  };

  // Handle CSV export
  const handleExport = async (type: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      if (type === 'csv') {
        exportTransactionsToCSV(processedTransactions);
      } else if (type === 'json') {
        exportTransactionsToJSON(processedTransactions);
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล', {
        description: 'โปรดลองอีกครั้งในภายหลัง',
      });
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  // Loading state
  if (transactionsLoading) {
    return <TransactionListSkeleton />;
  }

  // Empty state
  if (!transactions.length) {
    return (
      <EmptyState 
        icon={<FileText className="h-10 w-10 text-muted-foreground" />}
        title="ไม่มีรายการธุรกรรม"
        description="คุณยังไม่มีรายการธุรกรรมใด ๆ เพิ่มรายการแรกของคุณเพื่อเริ่มต้น"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Card className="border bg-green-50/30 hover:shadow-sm transition-shadow duration-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">รายรับทั้งหมด</p>
                <p className="text-xl font-bold text-green-600 mt-1">{summary.totalIncome.toLocaleString('th-TH')} บาท</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-red-50/30 hover:shadow-sm transition-shadow duration-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">รายจ่ายทั้งหมด</p>
                <p className="text-xl font-bold text-red-600 mt-1">{summary.totalExpense.toLocaleString('th-TH')} บาท</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className={`border ${summary.balance >= 0 ? 'bg-blue-50/30' : 'bg-amber-50/30'} hover:shadow-sm transition-shadow duration-200`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ยอดคงเหลือ</p>
                <p className={`text-xl font-bold mt-1 ${summary.balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                  {summary.balance.toLocaleString('th-TH')} บาท
                </p>
              </div>
              <div className={`p-2 rounded-full ${summary.balance >= 0 ? 'bg-blue-100' : 'bg-amber-100'}`}>
                <Wallet className={`h-5 w-5 ${summary.balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        {showFilters && (
          <CardHeader className="pb-0">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    รายการธุรกรรม
                    <Badge variant="secondary" className="ml-2">
                      {processedTransactions.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    ค้นหา กรอง และจัดการรายการธุรกรรมของคุณ
                  </CardDescription>
                </div>
              </div>
              
              <TransactionFilters 
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                uniqueCategories={uniqueCategories}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </CardHeader>
        )}
        
        <Separator className="my-1" />
        
        <CardContent className="p-4">
          {!processedTransactions.length ? (
            <EmptyState 
              icon={<Search className="h-8 w-8 text-muted-foreground" />}
              title="ไม่พบรายการที่ตรงกับเงื่อนไข"
              description="ลองเปลี่ยนตัวกรองหรือคำค้นหาเพื่อดูรายการธุรกรรมอื่น ๆ"
              action={
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  รีเซ็ตตัวกรอง
                </Button>
              }
            />
          ) : (
            <TransactionTable 
              transactions={displayedTransactions} 
              onViewDetails={setSelectedTransaction}
              onViewImage={setShowImageModal}
              onDeleteClick={setDeleteId}
            />
          )}
        </CardContent>
        
        {processedTransactions.length > itemsPerPage && !limitCount && (
          <CardFooter className="border-t p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
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
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">ก่อนหน้า</span>
              </Button>
              <div className="text-sm font-medium bg-muted/30 px-3 py-1 rounded">
                {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline">ถัดไป</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Modals */}
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
        onViewImage={setShowImageModal}
        username={user?.name}
      />
      
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="ยืนยันการลบรายการ"
        description="การลบจะไม่สามารถย้อนกลับได้ คุณแน่ใจหรือไม่ที่จะลบรายการนี้"
        confirmText="ลบรายการ"
        intent="delete"
      />
    </div>
  );
}