'use client';

import { cn } from '@/utils/utils';
import { Transaction } from '@/types';
import { ArrowUpCircle, ArrowDownCircle, Trash2, ImageIcon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatToShortDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TransactionTableProps {
  transactions: Transaction[];
  onViewDetails: (transaction: Transaction) => void;
  onViewImage: (imageUrl: string) => void;
  onDeleteClick: (id: string) => void;
}

export default function TransactionTable({
  transactions,
  onViewDetails,
  onViewImage,
  onDeleteClick,
}: TransactionTableProps) {
  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className={cn(
            'group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-all',
            'hover:bg-muted/30 focus-within:bg-muted/30 focus-within:ring-1 focus-within:ring-primary',
            transaction.type === 'income' 
              ? 'border-l-4 border-l-green-500'
              : 'border-l-4 border-l-red-500'
          )}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  transaction.type === 'income'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                )}
              >
                {transaction.type === 'income' ? (
                  <ArrowUpCircle className="h-4 w-4" />
                ) : (
                  <ArrowDownCircle className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-2">
                <p className="font-medium">{transaction.category}</p>
                {transaction.receipt_images && transaction.receipt_images.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs flex items-center gap-1 px-1.5 py-0.5 w-fit"
                  >
                    <ImageIcon className="h-3 w-3" />
                    <span>ใบเสร็จ</span>
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{formatToShortDate(transaction.date)}</p>
            {transaction.description && (
              <p className="text-sm mt-1 max-w-[300px] truncate">{transaction.description}</p>
            )}
          </div>
          
          <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-3">
            <span
              className={cn(
                'font-medium text-base',
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
            </span>
            
            <div className="flex items-center gap-1">
              {transaction.receipt_images && transaction.receipt_images.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted"
                  onClick={() => onViewImage(transaction.receipt_images[0])}
                  title="ดูใบเสร็จ"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={() => onViewDetails(transaction)}
                title="ดูรายละเอียด"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground rounded-full 
                           opacity-70 group-hover:opacity-100
                           hover:bg-red-50 hover:text-red-500"
                onClick={() => onDeleteClick(transaction.id)}
                title="ลบรายการ"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}