'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, CheckCircle, X, Loader2, RotateCw, Eye, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function CameraCapture({ onCapture, onCancel, isProcessing = false }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Start camera operation
  const startCamera = async () => {
    setCameraError(null);
    
    try {
      if (stream) {
        // Stop previous stream
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Request camera access
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('ไม่สามารถเข้าถึงกล้องได้ โปรดตรวจสอบว่าคุณได้ให้สิทธิ์การใช้งานกล้องแล้ว');
    }
  };

  // Switch between front and back cameras
  const switchCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  };
  
  // Capture image function
  const captureImage = () => {
    if (!canvasRef.current || !videoRef.current || !isCameraReady) return;
    
    setIsCapturing(true);
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video) {
        setIsCapturing(false);
        return;
      }
      
      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsCapturing(false);
        return;
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to Data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(imageDataUrl);
      
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setCameraReady(false);
      }
      
      setIsCapturing(false);
    }, 150);
  };
  
  // Retake photo and restart camera
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };
  
  // Confirm captured image
  const confirmImage = () => {
    if (!capturedImage) return;
    
    // Convert Data URL to Blob and File
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const fileName = `receipt_${new Date().getTime()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        onCapture(file);
      })
      .catch(error => {
        console.error('Error creating file from canvas:', error);
        setCameraError('เกิดข้อผิดพลาดในการสร้างไฟล์รูปภาพ');
      });
  };

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    
    // Cleanup on component unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraFacing]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-xl mx-auto overflow-hidden border border-border/50 shadow-lg">
        <CardContent className="p-0">
          <div className="relative">
            {/* Camera viewport */}
            <div className={cn(
              "aspect-video w-full relative overflow-hidden",
              capturedImage || !isCameraReady ? 'hidden' : ''
            )}>
              {/* Video element */}
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Viewfinder overlay */}
              {isCameraReady && !capturedImage && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner guides */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/70 rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/70 rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/70 rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/70 rounded-br-lg"></div>
                  
                  {/* Scanning line animation */}
                  <motion.div 
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" 
                    initial={{ top: "10%", opacity: 0 }}
                    animate={{ 
                      top: ["10%", "90%", "10%"],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      ease: "easeInOut", 
                      repeat: Infinity 
                    }}
                  />
                  
                  {/* Subtle iris vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-accent/3 mix-blend-overlay rounded-3xl"></div>
                  
                  {/* Focus indicator */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-20 h-20 border-2 border-dashed border-primary/40 rounded-full"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.7, 0.3],
                        rotate: [0, 360],
                      }}
                      transition={{ 
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                        opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Captured image display */}
            <AnimatePresence>
              {capturedImage && (
                <motion.div 
                  className="aspect-video w-full relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={capturedImage} 
                    alt="Captured receipt" 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Scanning completion effect */}
                  <motion.div 
                    className="absolute inset-0 border-2 border-accent/0"
                    animate={{ 
                      borderColor: ["rgba(234, 179, 8, 0)", "rgba(234, 179, 8, 0.5)", "rgba(234, 179, 8, 0)"]
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Loading state */}
            <AnimatePresence>
              {!isCameraReady && !capturedImage && !cameraError && (
                <motion.div 
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Eye-themed loader */}
                  <motion.div 
                    className="relative w-16 h-16 mb-3"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="absolute inset-0 rounded-full border-2 border-primary/80"></div>
                    <motion.div 
                      className="absolute inset-4 rounded-full bg-gradient-to-r from-primary to-accent"
                      animate={{ scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Scanning line */}
                    <motion.div 
                      className="absolute left-0 right-0 h-[1px] bg-white" 
                      animate={{ 
                        top: ["30%", "70%", "30%"],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        ease: "easeInOut", 
                        repeat: Infinity 
                      }}
                    />
                  </motion.div>
                  <p className="text-white font-medium">กำลังเปิดกล้อง...</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Error state */}
            <AnimatePresence>
              {cameraError && (
                <motion.div 
                  className="aspect-video w-full flex items-center justify-center bg-card/95"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center p-6">
                    <motion.div
                      className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <X className="h-8 w-8 text-destructive" />
                    </motion.div>
                    <p className="text-foreground mb-4">{cameraError}</p>
                    <Button 
                      variant="outline" 
                      className="border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                      onClick={startCamera}
                    >
                      <RotateCw className="mr-2 h-4 w-4" />
                      ลองอีกครั้ง
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Control buttons */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-6">
              {!capturedImage ? (
                <>
                  {/* Switch camera button */}
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="secondary"
                      size="icon" 
                      className="rounded-full w-12 h-12 bg-card/80 backdrop-blur-sm hover:bg-card shadow-md border border-border/50"
                      onClick={switchCamera}
                      disabled={!isCameraReady || isProcessing}
                    >
                      <RotateCw className="h-5 w-5 text-primary" />
                    </Button>
                  </motion.div>
                  
                  {/* Capture button */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline"
                      size="icon" 
                      className="rounded-full w-16 h-16 bg-card/90 backdrop-blur-sm hover:bg-card shadow-lg border-2 border-primary"
                      onClick={captureImage}
                      disabled={!isCameraReady || isProcessing || isCapturing}
                    >
                      <AnimatePresence mode="wait">
                        {isCapturing ? (
                          <motion.div
                            key="capturing"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                            className="text-primary"
                          >
                            <ScanLine className="h-7 w-7" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="ready"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                            className="text-primary"
                          >
                            <Camera className="h-7 w-7" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Ripple effect on capture */}
                      {isCapturing && (
                        <motion.div 
                          className="absolute inset-0 rounded-full border-2 border-primary"
                          animate={{ 
                            scale: [1, 1.5],
                            opacity: [1, 0]
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                  
                  {/* Cancel button */}
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="secondary"
                      size="icon" 
                      className="rounded-full w-12 h-12 bg-card/80 backdrop-blur-sm hover:bg-card shadow-md border border-border/50"
                      onClick={onCancel}
                      disabled={isProcessing}
                    >
                      <X className="h-5 w-5 text-foreground" />
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Retake button */}
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="outline"
                      size="icon" 
                      className="rounded-full w-12 h-12 bg-card/90 backdrop-blur-sm hover:bg-card shadow-md border-2 border-destructive"
                      onClick={retakePhoto}
                      disabled={isProcessing}
                    >
                      <X className="h-5 w-5 text-destructive" />
                    </Button>
                  </motion.div>
                  
                  {/* Confirm button */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline"
                      size="icon" 
                      className="rounded-full w-16 h-16 bg-card/90 backdrop-blur-sm hover:bg-card shadow-lg border-2 border-accent"
                      onClick={confirmImage}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-7 w-7 text-accent animate-spin" />
                      ) : (
                        <CheckCircle className="h-7 w-7 text-accent" />
                      )}
                      
                      {/* Progress indicator during processing */}
                      {isProcessing && (
                        <motion.div 
                          className="absolute inset-0 rounded-full"
                          initial={{ background: "conic-gradient(#a16207 0%, transparent 0%)" }}
                          animate={{ background: ["conic-gradient(#a16207 0%, transparent 0%)", "conic-gradient(#a16207 360deg, transparent 0%)"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
          
          {/* Status indicator */}
          {isCameraReady && !capturedImage && (
            <motion.div
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-card/70 backdrop-blur-sm rounded-full shadow-sm border border-border/40"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-medium">กล้องพร้อมใช้งาน</span>
            </motion.div>
          )}
          
          {/* Face mode indicator */}
          {isCameraReady && !capturedImage && (
            <motion.div
              className="absolute top-4 right-4 px-3 py-1.5 bg-card/70 backdrop-blur-sm rounded-full shadow-sm border border-border/40"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-xs font-medium">
                {cameraFacing === 'environment' ? 'กล้องหลัง' : 'กล้องหน้า'}
              </span>
            </motion.div>
          )}
          
          {/* Processing overlay */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <motion.div className="relative w-16 h-16 mx-auto mb-3">
                    {/* Eye-shaped progress indicator */}
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
                      className="absolute inset-6 rounded-full bg-primary/50"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
                    
                    {/* Scanning line */}
                    <motion.div 
                      className="absolute left-0 right-0 h-[1px] bg-accent" 
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
                  <p className="text-white font-medium">กำลังประมวลผล...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}