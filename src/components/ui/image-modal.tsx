'use client';

import * as React from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize, Minimize } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
}

export function ImageModal({
  imageUrl,
  onClose,
  isOpen,
  title = 'ใบเสร็จ',
}: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotateLeft = () => setRotation((prev) => prev - 90);
  const handleRotateRight = () => setRotation((prev) => prev + 90);
  
  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      const elem = document.getElementById('image-container');
      if (elem) {
        try {
          await elem.requestFullscreen();
          setIsFullscreen(true);
        } catch (err) {
          console.error('Error attempting to enable fullscreen:', err);
        }
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Reset transformations when closing
  React.useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setRotation(0);
    }
  }, [isOpen]);
  
  // Handle fullscreen change event
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span>{title}</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div 
          className="relative flex-1 overflow-auto h-[60vh]"
          id="image-container"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none h-8" />
          <div className="flex items-center justify-center h-full p-2">
            <motion.img
              src={imageUrl}
              alt="Receipt"
              className="object-contain rounded-md select-none"
              style={{ 
                scale, 
                rotate: rotation,
                transition: 'scale 0.2s ease, rotate 0.3s ease',
              }}
              drag
              dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
              whileDrag={{ cursor: 'grabbing' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </div>
          
          {/* Image controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <TooltipProvider>
              <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 border shadow-md">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleZoomOut}
                      className="h-8 w-8 rounded-full"
                      disabled={scale <= 0.5}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>ซูมออก</TooltipContent>
                </Tooltip>
                
                <div className="text-xs font-mono bg-muted px-2 py-1 rounded-md">
                  {Math.round(scale * 100)}%
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleZoomIn}
                      className="h-8 w-8 rounded-full"
                      disabled={scale >= 3}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>ซูมเข้า</TooltipContent>
                </Tooltip>
                
                <div className="w-px h-4 bg-border mx-1" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRotateLeft}
                      className="h-8 w-8 rounded-full"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>หมุนซ้าย</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRotateRight}
                      className="h-8 w-8 rounded-full"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>หมุนขวา</TooltipContent>
                </Tooltip>
                
                <div className="w-px h-4 bg-border mx-1" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleFullscreen}
                      className="h-8 w-8 rounded-full"
                    >
                      {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                      ) : (
                        <Maximize className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
        
        <DialogFooter className="p-4 border-t gap-2 flex-row justify-end">
          <Button variant="outline" onClick={onClose}>
            ปิด
          </Button>
          <Button asChild variant="default">
            <a 
              href={imageUrl} 
              download 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              ดาวน์โหลด
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}