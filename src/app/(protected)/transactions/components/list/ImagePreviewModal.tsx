'use client';

import { X, Download, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState } from 'react';

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
  const [scale, setScale] = useState(1);
  
  if (!imageUrl) return null;

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-border/50 p-1">
        <DialogHeader className="px-4 py-2 bg-gradient-to-r from-primary/5 to-transparent">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <span>ใบเสร็จ</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-primary/5"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative overflow-hidden bg-muted/5">
          {/* Scanning line animation */}
          <motion.div 
            className="absolute left-0 right-0 h-[1px] bg-primary/30 pointer-events-none" 
            animate={{ 
              top: ["0%", "100%", "0%"],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 8, 
              ease: "linear", 
              repeat: Infinity 
            }}
          />
          
          <div className="flex justify-center p-4 overflow-auto max-h-[70vh]">
            <motion.img
              src={imageUrl}
              alt="Receipt"
              className="object-contain rounded-md"
              style={{ scale }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onClick={resetZoom}
            />
          </div>
        </div>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between px-4 py-2 bg-gradient-to-r from-transparent to-primary/5">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={zoomOut} 
              className="w-9 p-0 border-primary/20"
            >
              <ZoomOut className="h-4 w-4 text-primary" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={resetZoom} 
              className="border-primary/20"
            >
              {Math.round(scale * 100)}%
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={zoomIn}
              className="w-9 p-0 border-primary/20"
            >
              <ZoomIn className="h-4 w-4 text-primary" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-border/50">
              ปิด
            </Button>
            <Button 
              asChild
              className="bg-primary hover:bg-primary/90"
            >
              <a href={imageUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                ดาวน์โหลด
              </a>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}