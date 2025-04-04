'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Trash2, AlertTriangle, HelpCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const confirmVariants = cva('', {
  variants: {
    intent: {
      delete: 'border-red-200',
      warning: 'border-amber-200',
      info: 'border-blue-200',
    },
  },
  defaultVariants: {
    intent: 'delete',
  },
});

interface ConfirmDialogProps extends VariantProps<typeof confirmVariants> {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  intent?: 'delete' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  intent = 'delete',
}: ConfirmDialogProps) {
  // Get proper icon based on intent
  const Icon = React.useMemo(() => {
    switch (intent) {
      case 'delete':
        return Trash2;
      case 'warning':
        return AlertTriangle;
      case 'info':
      default:
        return HelpCircle;
    }
  }, [intent]);

  // Configure button style based on intent
  const buttonVariant = React.useMemo(() => {
    switch (intent) {
      case 'delete':
        return 'destructive';
      case 'warning':
        return 'ghost';
      case 'info':
      default:
        return 'default';
    }
  }, [intent]);

  // Handle enter key to confirm
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isOpen) {
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent 
        className={cn("max-w-md border-t-4", confirmVariants({ intent }))}
        asChild
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <AlertDialogHeader className="gap-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-full",
                intent === 'delete' && "bg-red-100 text-red-600",
                intent === 'warning' && "bg-amber-100 text-amber-600",
                intent === 'info' && "bg-blue-100 text-blue-600",
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <AlertDialogTitle>{title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel asChild>
              <Button variant="outline">{cancelText}</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                variant={buttonVariant}
                onClick={(e) => {
                  e.preventDefault();
                  onConfirm();
                }}
                className={cn(
                  "gap-1",
                  intent === 'delete' && "bg-red-600 hover:bg-red-700",
                )}
              >
                <Icon className="h-4 w-4" />
                {confirmText}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}