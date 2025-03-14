/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, AlertCircle, ImageIcon, ZoomIn, PlusCircle, Camera } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './Camera';

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void;
  maxFiles?: number;
  isProcessing?: boolean;
  acceptedFileTypes?: Record<string, string[]>;
  maxSizeInMB?: number;
}

export default function ImageUploader({ 
  onImagesSelected, 
  maxFiles = 100, 
  isProcessing = false,
  acceptedFileTypes = {
    'image/jpeg': [],
    'image/png': [],
    'image/heic': [],
    'image/heif': []
  },
  maxSizeInMB = 100
}: ImageUploaderProps) {
  const [previewImages, setPreviewImages] = useState<{ file: File; preview: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  // Notify parent component when previewImages changes
  useEffect(() => {
    if (previewImages.length > 0) {
      onImagesSelected(previewImages.map(item => item.file));
    }
  }, [previewImages, onImagesSelected]);
  
  // Simulate upload progress for better UX
  useEffect(() => {
    if (uploadProgress > 0 && uploadProgress < 100) {
      const timer = setTimeout(() => {
        setUploadProgress(prev => Math.min(prev + 10, 100));
      }, 100);
      return () => clearTimeout(timer);
    } else if (uploadProgress === 100) {
      const timer = setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [uploadProgress]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      previewImages.forEach(image => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [previewImages]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    // Reset error message
    setErrorMessage(null);
    
    // Handle file rejections
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setErrorMessage(`ไฟล์ขนาดใหญ่เกินไป (สูงสุด ${maxSizeInMB}MB)`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setErrorMessage('ประเภทไฟล์ไม่รองรับ (รองรับ JPG, PNG, HEIC เท่านั้น)');
      } else {
        setErrorMessage('มีข้อผิดพลาดในการอัปโหลดไฟล์');
      }
      return;
    }

    // Check if adding more files would exceed the limit
    if (previewImages.length + acceptedFiles.length > maxFiles) {
      setErrorMessage(`สามารถอัปโหลดได้ไม่เกิน ${maxFiles} ไฟล์`);
      // Take only the files that fit within the limit
      acceptedFiles = acceptedFiles.slice(0, maxFiles - previewImages.length);
      if (acceptedFiles.length === 0) return;
    }

    // Start progress animation
    setUploadProgress(10);
    
    // Create previews for selected images
    const newPreviewImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    // Update preview images state
    setPreviewImages(prev => {
      // Combine with existing images but don't exceed maxFiles
      return [...prev, ...newPreviewImages].slice(0, maxFiles);
    });
  }, [maxFiles, maxSizeInMB, previewImages.length]);
  
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles,
    maxSize: maxSizeInMB * 1024 * 1024,
    noClick: previewImages.length > 0,
    noKeyboard: previewImages.length > 0,
  });
  
  const removeImage = useCallback((index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setPreviewImages(prev => {
      // Clean up the URL object for the removed image
      URL.revokeObjectURL(prev[index].preview);
      
      // Create a new array without the removed image
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    if (currentPreviewIndex === index) {
      setCurrentPreviewIndex(null);
    } else if (currentPreviewIndex !== null && currentPreviewIndex > index) {
      setCurrentPreviewIndex(currentPreviewIndex - 1);
    }
  }, [currentPreviewIndex]);

  const handleCameraCapture = (file: File) => {
    // Create a preview for the captured image
    const imagePreview = {
      file,
      preview: URL.createObjectURL(file)
    };
    
    // Add to preview images
    setPreviewImages(prev => {
      // Check if adding would exceed the limit
      if (prev.length >= maxFiles) {
        // Replace the first image
        URL.revokeObjectURL(prev[0].preview);
        const updated = [...prev];
        updated.shift();
        return [...updated, imagePreview];
      }
      return [...prev, imagePreview];
    });
    
    setShowCamera(false);
  };
  
  const fileTypeLabels = {
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/heic': 'HEIC',
    'image/heif': 'HEIF'
  };

  const getFileTypeLabel = (file: File) => {
    return fileTypeLabels[file.type as keyof typeof fileTypeLabels] || 'IMAGE';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get percentage of max files used
  const filesPercentage = (previewImages.length / maxFiles) * 100;

  // ตรวจสอบว่าเบราว์เซอร์รองรับ camera API หรือไม่
  const isCameraSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
  if (!isClient) {
    return <div className="min-h-[200px] bg-muted/20 rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Loading uploader...</p>
    </div>;
  }
  return (
    <div className="space-y-4">
      {showCamera ? (
        <CameraCapture 
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
          isProcessing={isProcessing}
        />
      ) : (
        <div 
          {...getRootProps()} 
          className={cn(
            "relative border-2 border-dashed rounded-xl transition-all duration-300 overflow-hidden",
            previewImages.length === 0 && "p-8",
            previewImages.length > 0 && "p-4",
            isDragActive && !isProcessing ? "border-primary bg-primary/5 shadow-md" : "border-muted",
            isProcessing && "opacity-75 pointer-events-none",
            "hover:border-primary/50 hover:bg-muted/5"
          )}
        >
          <input {...getInputProps()} />
          
          {/* Drag overlay */}
          {isDragActive && (
            <div className="absolute inset-0 bg-primary/5 flex items-center justify-center z-10">
              <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg text-center">
                <UploadCloud className="w-12 h-12 mx-auto text-primary animate-bounce" />
                <p className="font-medium text-lg mt-2">วางรูปภาพเพื่ออัปโหลด</p>
              </div>
            </div>
          )}

          {previewImages.length === 0 ? (
            <div className="text-center">
              <div className="p-4 bg-muted/20 inline-flex rounded-full mb-4">
                <UploadCloud className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">อัปโหลดรูปภาพของคุณ</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </p>
              <div className="flex justify-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                  disabled={isProcessing}
                  className="group"
                >
                  <ImageIcon className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                  เลือกรูปภาพ
                </Button>
                
                {isCameraSupported && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCamera(true);
                    }}
                    disabled={isProcessing}
                    className="group"
                  >
                    <Camera className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                    ถ่ายภาพ
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                รองรับไฟล์ JPG, PNG, HEIC (สูงสุด {maxFiles} ไฟล์, ขนาดไม่เกิน {maxSizeInMB}MB ต่อไฟล์)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">รูปภาพที่เลือก</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">เลือกรูปเพื่อดูตัวอย่าง</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {previewImages.length}/{maxFiles}
                  </Badge>
                  <div className="flex gap-2">
                    {isCameraSupported && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCamera(true);
                        }} 
                        disabled={previewImages.length >= maxFiles || isProcessing}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        open();
                      }} 
                      disabled={previewImages.length >= maxFiles || isProcessing}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-1 left-0 w-full h-1">
                  <div 
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      filesPercentage < 70 ? "bg-green-500" : 
                      filesPercentage < 90 ? "bg-amber-500" : 
                      "bg-red-500"
                    )} 
                    style={{ width: `${filesPercentage}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {previewImages.map((image, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <div 
                          className={cn(
                            "relative rounded-md overflow-hidden border aspect-square cursor-pointer",
                            "transition-all duration-200 group hover:border-primary hover:shadow-md",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          )}
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            setCurrentPreviewIndex(index);
                          }}
                        >
                          <Image
                            src={image.preview}
                            alt={`รูปภาพ ${index + 1}`}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            width={200}
                            height={200}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => removeImage(index, e)}
                            disabled={isProcessing}
                            aria-label="ลบรูปภาพ"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="absolute bottom-1 left-1 bg-black/50 rounded px-1.5 py-0.5 text-xs text-white/90">
                            {getFileTypeLabel(image.file)}
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl p-1 sm:p-2">
                        <div className="relative aspect-auto h-full max-h-[70vh] w-full">
                          <Image
                            src={image.preview}
                            alt={`รูปภาพ ${index + 1}`}
                            className="object-contain w-full h-full rounded-md"
                            width={1200}
                            height={800}
                          />
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                              onClick={(e) => removeImage(index, e)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1.5 text-xs flex items-center space-x-3">
                            <span className="flex items-center">
                              <Badge variant="secondary" className="mr-2">{getFileTypeLabel(image.file)}</Badge>
                              {image.file.name}
                            </span>
                            <span>{formatFileSize(image.file.size)}</span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Upload progress indicator */}
          {uploadProgress > 0 && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs">
                <span>กำลังเตรียมรูปภาพ</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1" />
            </div>
          )}
        </div>
      )}
      {/* Error message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2 text-sm">
                {errorMessage}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center py-4 bg-muted/20 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin mr-3 text-primary" />
          <div>
            <p className="font-medium">กำลังประมวลผลรูปภาพ</p>
            <p className="text-xs text-muted-foreground">โปรดรอสักครู่...</p>
          </div>
        </div>
      )}
    </div>
  );
}