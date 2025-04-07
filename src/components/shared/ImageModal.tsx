'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, X } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ imageUrl, isOpen, onClose }: ImageModalProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            ใบเสร็จ
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 text-center">
          <img src={imageUrl} alt="receipt" className="max-h-[70vh] mx-auto rounded-md" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ปิด</Button>
          <Button asChild>
            <a href={imageUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="mr-1.5 h-4 w-4" />
              ดาวน์โหลด
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
