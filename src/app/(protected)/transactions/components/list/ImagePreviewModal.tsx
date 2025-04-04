'use client';

import { X, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
  isOpen: boolean;
}

export default function ImagePreviewModal({
  imageUrl,
  onClose,
  isOpen,
}: ImagePreviewModalProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between">
            <span>ใบเสร็จ</span>
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
        
        <div className="flex justify-center p-4">
          <img
            src={imageUrl}
            alt="Receipt"
            className="max-h-[70vh] object-contain rounded-md"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ปิด
          </Button>
          <Button asChild>
            <a href={imageUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              ดาวน์โหลด
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}