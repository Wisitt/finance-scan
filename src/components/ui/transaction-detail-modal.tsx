'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types';
import { Trash2, X, ImageIcon, Calendar, Tag, Clock, Edit, InfoIcon, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatToShortDate, timeAgo } from '@/utils/dateUtils';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
  onViewImage?: (imageUrl: string) => void;
  username?: string | null;
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onDelete,
  onEdit,
  onViewImage,
  username,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const hasReceipts = transaction.receipt_images && transaction.receipt_images.length > 0;
  const createdAtDate = transaction.created_at ? new Date(transaction.created_at) : null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col space-y-0.5">
            <DialogTitle className="text-lg">รายละเอียดธุรกรรม</DialogTitle>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> 
              {createdAtDate ? timeAgo(createdAtDate) : 'ไม่ระบุเวลา'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ปิด</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {/* Type and Amount - Hero section */}
          <div className={cn(
            "flex justify-between items-center p-4 rounded-lg border",
            transaction.type === 'income' ? "bg-green-50/50" : "bg-red-50/50",
            transaction.type === 'income' ? "border-green-100" : "border-red-100",
          )}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Badge
                variant="outline"
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium',
                  transaction.type === 'income'
                    ? 'bg-green-100 text-green-600 border-green-200'
                    : 'bg-red-100 text-red-600 border-red-200'
                )}
              >
                {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
              </Badge>
            </motion.div>
            
            <motion.p
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'text-xl font-bold',
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {transaction.type === 'income' ? '+' : '-'}{' '}
              {formatCurrency(transaction.amount)}
            </motion.p>
          </div>
          
          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> วันที่
                </div>
                <p className="font-medium">{formatToShortDate(transaction.date)}</p>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> หมวดหมู่
                </div>
                <p className="font-medium">{transaction.category || 'ไม่ระบุ'}</p>
              </div>
              
              <div className="col-span-2 space-y-1.5">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <InfoIcon className="h-3.5 w-3.5" /> รายละเอียด
                </div>
                <p className="font-medium whitespace-pre-wrap">
                  {transaction.description || '-'}
                </p>
              </div>
            </div>
            
            {/* Receipt Images */}
            {hasReceipts && (
              <div className="space-y-2 pt-2">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" /> ใบเสร็จ
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {transaction.receipt_images?.map((img, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative aspect-square rounded-md overflow-hidden border bg-muted/20 group"
                      onClick={() => onViewImage && onViewImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Receipt ${idx + 1}`}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <InfoIcon className="h-3 w-3" />
              <span>ID: {transaction.id.substring(0, 8)}...</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{username || 'ไม่ระบุ'}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 flex-row">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            ปิด
          </Button>
          
          {onEdit && (
            <Button
              variant="secondary"
              onClick={() => transaction && onEdit(transaction)}
              className="flex-1 gap-1"
            >
              <Edit className="h-3.5 w-3.5" />
              แก้ไข
            </Button>
          )}
          
          <Button
            variant="destructive"
            onClick={() => onDelete(transaction.id)}
            className="flex-1 gap-1 bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            ลบ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}