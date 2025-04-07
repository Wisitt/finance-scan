/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, AlertCircle, ImageIcon, ZoomIn, PlusCircle, Camera, Eye, ScanLine } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './Camera';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void;
  resetKey?: string;
  maxFiles?: number;
  isProcessing?: boolean;
  acceptedFileTypes?: Record<string, string[]>;
  maxSizeInMB?: number;
}

export default function ImageUploader({ 
  onImagesSelected, 
  resetKey,
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
  const [scanningActive, setScanningActive] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Start scanning animation when component mounts
    setScanningActive(true);
  }, []);

  useEffect(() => {
    setPreviewImages([]);
    setErrorMessage(null);
    setUploadProgress(0);
    setCurrentPreviewIndex(null);
  }, [resetKey]);
  
  // Notify parent component when previewImages changes
  useEffect(() => {
    if (previewImages.length > 0) {
      onImagesSelected(previewImages.map(item => item.file));
    } else {
      onImagesSelected([]);
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
    setErrorMessage(null);

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

    if (previewImages.length + acceptedFiles.length > maxFiles) {
      setErrorMessage(`สามารถอัปโหลดได้ไม่เกิน ${maxFiles} ไฟล์`);
      acceptedFiles = acceptedFiles.slice(0, maxFiles - previewImages.length);
      if (acceptedFiles.length === 0) return;
    }

    setUploadProgress(10);

    const newPreviewImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPreviewImages(prev => [...prev, ...newPreviewImages].slice(0, maxFiles));
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
      URL.revokeObjectURL(prev[index].preview);
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
    const imagePreview = {
      file,
      preview: URL.createObjectURL(file)
    };

    setPreviewImages(prev => {
      if (prev.length >= maxFiles) {
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

  // Check if browser supports camera API
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
            "hover:border-primary/50 hover:bg-muted/5",
            "group/uploader"
          )}
        >
          <input {...getInputProps()} />
          
          {/* Scanning line animation */}
          <motion.div 
            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none" 
            animate={scanningActive ? { 
              top: ["5%", "95%", "5%"],
              opacity: [0, 0.7, 0]
            } : {}}
            transition={{ 
              duration: 4, 
              ease: "easeInOut", 
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          />
          
          {/* Drag overlay with eye theme */}
          {isDragActive && (
            <motion.div 
              className="absolute inset-0 bg-primary/5 flex items-center justify-center z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center"
                animate={{ scale: [0.95, 1] }}
                transition={{ duration: 0.3 }}
              >
                <motion.div className="relative w-16 h-16 mx-auto mb-3">
                  {/* Eye-shaped upload indicator */}
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute inset-3 rounded-full border-2 border-accent"
                    animate={{ scale: [1, 0.9, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="absolute inset-6 rounded-full bg-accent/30 flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  >
                    <UploadCloud className="h-5 w-5 text-accent" />
                  </motion.div>
                  
                  {/* Scanning line */}
                  <motion.div 
                    className="absolute left-0 right-0 h-[1px] bg-primary" 
                    animate={{ 
                      top: ["30%", "70%", "30%"],
                    }}
                    transition={{ 
                      duration: 1.5, 
                      ease: "easeInOut", 
                      repeat: Infinity 
                    }}
                  />
                </motion.div>
                <p className="font-medium text-lg mt-2">วางรูปภาพเพื่ออัปโหลด</p>
              </motion.div>
            </motion.div>
          )}

          {previewImages.length === 0 ? (
            <div className="text-center">
              <motion.div 
                className="relative w-16 h-16 mx-auto mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {/* Eye-shaped icon container */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-primary/10 flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.03, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Eye className="h-7 w-7 text-primary" />
                </motion.div>
                
                {/* Scanning line animation */}
                <motion.div 
                  className="absolute left-0 right-0 h-[1px] bg-primary/60" 
                  animate={{ 
                    top: ["30%", "70%", "30%"],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 2, 
                    ease: "easeInOut", 
                    repeat: Infinity 
                  }}
                />
                
                {/* Outer ring animation */}
                <motion.div 
                  className="absolute -inset-2 rounded-full border border-primary/20"
                  animate={{ 
                    scale: [0.9, 1.1, 0.9],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{ 
                    duration: 4, 
                    ease: "easeInOut", 
                    repeat: Infinity,
                  }}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-medium text-lg">อัปโหลดรูปภาพของคุณ</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์
                </p>
                <div className="flex justify-center gap-3">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        open();
                      }}
                      disabled={isProcessing}
                      className="group border-primary/30 hover:bg-primary/5 hover:border-primary"
                    >
                      <ImageIcon className="mr-2 h-4 w-4 text-primary" />
                      <span>เลือกรูปภาพ</span>
                    </Button>
                  </motion.div>
                  
                  {isCameraSupported && (
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCamera(true);
                        }}
                        disabled={isProcessing}
                        className="group border-accent/30 hover:bg-accent/5 hover:border-accent"
                      >
                        <Camera className="mr-2 h-4 w-4 text-accent" />
                        <span>ถ่ายภาพ</span>
                      </Button>
                    </motion.div>
                  )}
                </div>
                <motion.p 
                  className="text-xs text-muted-foreground mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  รองรับไฟล์ JPG, PNG, HEIC (สูงสุด {maxFiles} ไฟล์, ขนาดไม่เกิน {maxSizeInMB}MB ต่อไฟล์)
                </motion.p>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium flex items-center">
                    <ScanLine className="h-4 w-4 text-primary mr-1.5" />
                    รูปภาพที่เลือก
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">เลือกรูปเพื่อดูตัวอย่าง</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "border-border",
                      filesPercentage > 80 && "bg-destructive/10 text-destructive border-destructive/30",
                      filesPercentage <= 80 && filesPercentage > 50 && "bg-accent/10 text-accent border-accent/30",
                      filesPercentage <= 50 && "bg-primary/10 text-primary border-primary/30"
                    )}
                  >
                    {previewImages.length}/{maxFiles}
                  </Badge>
                  <div className="flex gap-2">
                    {isCameraSupported && (
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCamera(true);
                          }} 
                          disabled={previewImages.length >= maxFiles || isProcessing}
                          className="hover:text-accent hover:bg-accent/5"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          open();
                        }} 
                        disabled={previewImages.length >= maxFiles || isProcessing}
                        className="hover:text-primary hover:bg-primary/5"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-1 left-0 w-full h-1">
                  <div 
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      filesPercentage < 50 ? "bg-gradient-to-r from-primary/80 to-primary" : 
                      filesPercentage < 80 ? "bg-gradient-to-r from-accent/80 to-accent" : 
                      "bg-gradient-to-r from-destructive/80 to-destructive"
                    )} 
                    style={{ width: `${filesPercentage}%` }}
                  />
                  
                  {/* Scanning progress indicator */}
                  {filesPercentage > 0 && (
                    <motion.div 
                      className="absolute top-0 w-1.5 h-1.5 rounded-full bg-background -translate-y-[2px]" 
                      animate={{ 
                        left: ["0%", `${Math.min(filesPercentage, 100)}%`, "0%"],
                      }}
                      transition={{ 
                        duration: 3, 
                        ease: "easeInOut", 
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
                  <AnimatePresence>
                    {previewImages.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Dialog>
                          <DialogTrigger asChild>
                            <div 
                              className={cn(
                                "relative rounded-md overflow-hidden border border-border/50 aspect-square cursor-pointer",
                                "transition-all duration-200 group hover:border-primary hover:shadow-md",
                                "focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1"
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
                              
                              {/* Hover overlay with scanning effect */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="relative">
                                  <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
                                  
                                  {/* Eye-like scanning effect on hover */}
                                  <motion.div 
                                    className="absolute -inset-4 rounded-full border border-primary/0 group-hover:border-primary/50" 
                                    animate={{ 
                                      scale: [1, 1.1, 1],
                                      opacity: [0, 0.8, 0]
                                    }}
                                    transition={{ 
                                      duration: 2, 
                                      repeat: Infinity 
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {/* Delete button */}
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
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
                              </motion.div>
                              
                              {/* File type badge */}
                              <div className="absolute bottom-1 left-1 bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5 text-xs text-white/90 flex items-center gap-1">
                                <div className="h-1 w-1 rounded-full bg-primary"></div>
                                {getFileTypeLabel(image.file)}
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-1 sm:p-2">
                            <DialogTitle>
                              <VisuallyHidden>
                                {`รูปภาพ ${index + 1} - ${image.file.name}`}
                              </VisuallyHidden>
                            </DialogTitle>
                            <div className="relative aspect-auto h-full max-h-[70vh] w-full">
                              <Image
                                src={image.preview}
                                alt={`รูปภาพ ${index + 1}`}
                                className="object-contain w-full h-full rounded-md"
                                width={1200}
                                height={800}
                              />
                              
                              {/* Scanning line overlay effect */}
                              <motion.div 
                                className="absolute left-0 right-0 h-[1px] bg-primary/30 pointer-events-none" 
                                animate={{ 
                                  top: ["10%", "90%", "10%"],
                                  opacity: [0.2, 0.6, 0.2]
                                }}
                                transition={{ 
                                  duration: 3, 
                                  ease: "easeInOut", 
                                  repeat: Infinity 
                                }}
                              />
                              
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 bg-background/80 backdrop-blur-sm border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(e) => removeImage(index, e)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </div>
                              
                              <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1.5 text-xs flex items-center space-x-3">
                                <span className="flex items-center">
                                  <Badge 
                                    variant="secondary" 
                                    className="mr-2 bg-primary/10 text-primary border-primary/30"
                                  >
                                    {getFileTypeLabel(image.file)}
                                  </Badge>
                                  {image.file.name}
                                </span>
                                <span>{formatFileSize(image.file.size)}</span>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
          
          {/* Upload progress indicator with eye theme */}
          {uploadProgress > 0 && (
            <motion.div 
              className="mt-4 space-y-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between text-xs">
                <span>กำลังเตรียมรูปภาพ</span>
                <span className="font-medium text-primary">{uploadProgress}%</span>
              </div>
              <div className="relative">
                <Progress 
                  value={uploadProgress} 
                  className="h-1.5 bg-muted/50" 
                  indicatorClassName="bg-gradient-to-r from-primary/80 to-primary"
                />
                {/* Scanning dot on progress bar */}
                <motion.div 
                  className="absolute top-0 w-2 h-2 rounded-full bg-accent -translate-y-[2px]" 
                  style={{ left: `${Math.min(uploadProgress, 95)}%` }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity
                  }}
                />
              </div>
            </motion.div>
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
      
      {/* Processing indicator with eye theme */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center py-4 bg-muted/20 rounded-lg border border-primary/10"
        >
          <div className="relative mr-4">
            {/* Eye-shaped processing indicator */}
            <motion.div 
              className="relative w-10 h-10"
              animate={{ rotate: 0 }}
            >
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute inset-2 rounded-full border-2 border-primary/50"
                animate={{ 
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
              <motion.div 
                className="absolute inset-4 rounded-full bg-primary/20 flex items-center justify-center"
                animate={{ 
                  scale: [1, 0.9, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4
                }}
              >
                <ScanLine className="h-3 w-3 text-primary" />
              </motion.div>
              
              {/* Scanning line */}
              <motion.div 
                className="absolute left-0 right-0 h-[1px] bg-primary/70" 
                animate={{ 
                  top: ["30%", "70%", "30%"],
                }}
                transition={{ 
                  duration: 1.5, 
                  ease: "easeInOut", 
                  repeat: Infinity 
                }}
              />
            </motion.div>
          </div>
          <div>
            <p className="font-medium">กำลังประมวลผลรูปภาพ</p>
            <p className="text-xs text-muted-foreground">โปรดรอสักครู่...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}