'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title = 'ยืนยัน',
  description = 'คุณแน่ใจหรือไม่?',
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
  loading,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">{cancelText}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onConfirm} disabled={loading}>
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
