'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';
import { formatToShortDate } from '@/utils/dateUtils';
import { ImageIcon, Trash2, X } from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  username?: string | null;
}

export default function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onDelete,
  username,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>รายละเอียดธุรกรรม</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-between items-center">
            <div
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium',
                transaction.type === 'income'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              )}
            >
              {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
            </div>
            <p
              className={cn(
                'text-lg font-bold',
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {transaction.type === 'income' ? '+' : '-'}{' '}
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm text-muted-foreground">วันที่</p>
              <p className="font-medium">{formatToShortDate(transaction.date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">หมวดหมู่</p>
              <p className="font-medium">{transaction.category}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">รายละเอียด</p>
              <p className="font-medium">{transaction.description || '-'}</p>
            </div>

            {transaction.receipt_images && transaction.receipt_images.length > 0 && (
              <div className="col-span-2 space-y-2">
                <p className="text-sm text-muted-foreground">ใบเสร็จ</p>
                <div className="flex gap-2 flex-wrap">
                  {transaction.receipt_images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 w-20 rounded-md overflow-hidden border hover:opacity-80 cursor-pointer"
                      onClick={() => window.open(img, '_blank')}
                    >
                      <img
                        src={img}
                        alt={`Receipt ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                        <ImageIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between text-xs text-muted-foreground">
            <div>ID: {transaction.id.substring(0, 8)}...</div>
            <div>รายการโดย: {username || 'ไม่ระบุ'}</div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            ปิด
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(transaction.id)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            ลบรายการ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}