'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTransactionStore } from '@/store/transactionStore';
import { Transaction } from '@/types';

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
  Download,
} from 'lucide-react';

// Components
import { TransactionFilters } from './TransactionFilters';
import { TransactionListSkeleton } from './TransactionListSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { TransactionDetailModal } from '@/components/ui/transaction-detail-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ImageModal } from '@/components/ui/image-modal';
import TransactionTable from './TransactionTable';

// Hooks and Utilities
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { exportTransactionsToCSV, exportTransactionsToJSON } from '@/utils/exportUtils';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  showFilters?: boolean;
  showExport?: boolean;
  showHeader?: boolean;
  limitCount?: number;
}

export function TransactionList({
  showFilters = true,
  showExport = false,
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

  // Handle CSV/JSON export
  const handleExport = async (type: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      if (type === 'csv') {
        exportTransactionsToCSV(processedTransactions);
      } else if (type === 'json') {
        exportTransactionsToJSON(processedTransactions);
      }
      toast.success('Export เรียบร้อย');
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
      {/* Header */}
      {showHeader && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border border-border/50 hover:shadow-sm transition-shadow duration-200 bg-gradient-to-br from-accent/5 to-transparent">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">รายรับทั้งหมด</p>
                <p className="text-xl font-bold text-accent mt-1">
                  {summary.totalIncome.toLocaleString('th-TH')} บาท
                </p>
              </div>
              <div className="p-2 bg-accent/10 rounded-full relative">
                <TrendingUp className="h-5 w-5 text-accent" />
                {/* Animated ring */}
                <motion.div 
                  className="absolute -inset-1 rounded-full border border-accent/30"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 hover:shadow-sm transition-shadow duration-200 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">รายจ่ายทั้งหมด</p>
                <p className="text-xl font-bold text-primary mt-1">
                  {summary.totalExpense.toLocaleString('th-TH')} บาท
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full relative">
                <TrendingDown className="h-5 w-5 text-primary" />
                {/* Animated ring */}
                <motion.div 
                  className="absolute -inset-1 rounded-full border border-primary/30"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border border-border/50 hover:shadow-sm transition-shadow duration-200",
              summary.balance >= 0 ? "bg-gradient-to-br from-secondary/5 to-transparent" : "bg-gradient-to-br from-destructive/5 to-transparent"
            )}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ยอดคงเหลือ</p>
                <p
                  className={cn(
                    "text-xl font-bold mt-1",
                    summary.balance >= 0 ? "text-secondary" : "text-destructive"
                  )}
                >
                  {summary.balance.toLocaleString('th-TH')} บาท
                </p>
              </div>
              <div
                className={cn(
                  "p-2 rounded-full relative",
                  summary.balance >= 0 ? "bg-secondary/10" : "bg-destructive/10"
                )}
              >
                <Wallet
                  className={cn(
                    "h-5 w-5",
                    summary.balance >= 0 ? "text-secondary" : "text-destructive"
                  )}
                />
                {/* Animated ring */}
                <motion.div 
                  className={cn(
                    "absolute -inset-1 rounded-full border",
                    summary.balance >= 0 ? "border-secondary/30" : "border-destructive/30"
                  )}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-0">
            <div className="flex flex-col gap-4">
              {/* Header and Export Buttons */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="relative">
                      <FileText className="h-4 w-4 text-primary" />
                        รายการธุรกรรม
                        <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
                          {processedTransactions.length}
                        </Badge>

                        </div>
                      </CardTitle>
                    </div>
                    <CardDescription>
                      ค้นหา กรอง และจัดการรายการธุรกรรมของคุณ
                    </CardDescription>

                  {/* Export buttons */}
                  {showExport && (
                    <div className="flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport('csv')}
                          disabled={isExporting}
                          className="border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 flex items-center gap-1.5"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export CSV
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport('json')}
                          disabled={isExporting}
                          className="border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 flex items-center gap-1.5"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export JSON
                        </Button>
                      </motion.div>
                    </div>
                  )}
              </div>

                {showFilters && (
                  <TransactionFilters
                    filters={filters}
                    updateFilter={updateFilter}
                    resetFilters={resetFilters}
                    uniqueCategories={uniqueCategories}
                    activeFilterCount={activeFilterCount}
                  />
                )}
            </div>
              </CardHeader>

              <Separator className="my-1 bg-border/50" />

              <CardContent className="p-4">
                <AnimatePresence mode="wait">
                  {!processedTransactions.length ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EmptyState
                        icon={
                          <div className="relative">
                            <Search className="h-8 w-8 text-muted-foreground" />
                            <motion.div 
                              className="absolute -inset-2 rounded-full bg-primary/10" 
                              animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.1, 0.3]
                              }}
                              transition={{ 
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          </div>
                        }
                        title="ไม่พบรายการที่ตรงกับเงื่อนไข"
                        description="ลองเปลี่ยนตัวกรองหรือคำค้นหาเพื่อดูรายการธุรกรรมอื่น ๆ"
                        action={
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={resetFilters}
                              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                            >
                              <Filter className="h-3.5 w-3.5 mr-1.5" />
                              รีเซ็ตตัวกรอง
                            </Button>
                          </motion.div>
                        }
                      />
                    </motion.div>
                  ) : (
                    <TransactionTable
                      transactions={displayedTransactions}
                      onViewDetails={setSelectedTransaction}
                      onViewImage={setShowImageModal}
                      onDeleteClick={setDeleteId}
                    />
                  )}
                </AnimatePresence>
              </CardContent>

            {/* Pagination */}
            {processedTransactions.length > itemsPerPage && !limitCount && (
              <CardFooter className="border-t border-border/50 p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="text-xs text-muted-foreground">
                  แสดง {startIndex + 1} -{' '}
                  {Math.min(startIndex + itemsPerPage, totalItems)} จากทั้งหมด{' '}
                  {totalItems} รายการ
                </div>
                <div className="flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-border/50 hover:bg-primary/5 hover:text-primary"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">ก่อนหน้า</span>
                    </Button>
                  </motion.div>
                  
                  <div className="text-sm font-medium bg-primary/5 text-primary px-3 py-1 rounded">
                    {currentPage} / {totalPages}
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-border/50 hover:bg-primary/5 hover:text-primary"
                    >
                      <span className="hidden sm:inline">ถัดไป</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </motion.div>
                </div>
              </CardFooter>
            )}
            
          </Card>
        </motion.div>

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
