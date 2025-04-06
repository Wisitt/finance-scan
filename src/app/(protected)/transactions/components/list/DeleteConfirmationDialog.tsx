'use client';

import { Trash2, Eye } from 'lucide-react';
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

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md border-border/50 shadow-lg">
        <AlertDialogHeader className="relative">
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="relative">
              <Trash2 className="h-5 w-5 text-destructive" />
              <motion.div 
                className="absolute -inset-2 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ backgroundColor: 'var(--destructive)', opacity: 0.2 }}
              />
            </div>
            ยืนยันการลบรายการ
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            คุณต้องการลบรายการนี้ใช่หรือไม่? การลบแล้วจะไม่สามารถยกเลิกได้
          </AlertDialogDescription>
          
          {/* Scanning line animation */}
          <motion.div 
            className="absolute left-0 right-0 h-[1px] bg-destructive/30 pointer-events-none" 
            animate={{ 
              top: ["30%", "70%", "30%"],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 3, 
              ease: "easeInOut", 
              repeat: Infinity 
            }}
          />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button variant="outline" className="border-border/50">ยกเลิก</Button>
            </motion.div>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button 
                variant="destructive"
                onClick={onConfirm} 
                className="bg-destructive hover:bg-destructive/90 gap-1"
              >
                <Trash2 className="h-4 w-4" />
                ลบรายการ
                
                {/* Add a subtle pulse effect for emphasis */}
                <motion.div 
                  className="absolute inset-0 rounded-md"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ backgroundColor: 'var(--destructive)', opacity: 0 }}
                />
              </Button>
            </motion.div>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}