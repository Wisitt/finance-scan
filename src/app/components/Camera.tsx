'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, CheckCircle, X, Loader2, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  
  // เริ่มการทำงานของกล้อง
  const startCamera = async () => {
    setCameraError(null);
    
    try {
      if (stream) {
        // หยุด stream เก่าก่อน
        stream.getTracks().forEach(track => track.stop());
      }
      
      // ขอสิทธิ์เข้าถึงกล้อง
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

  // สลับกล้องหน้า-หลัง
  const switchCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  };
  
  // ถ่ายภาพ
  const captureImage = () => {
    if (!canvasRef.current || !videoRef.current || !isCameraReady) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // ตั้งขนาดของ canvas ตาม video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // วาดเฟรมปัจจุบันของวิดีโอลงใน canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // แปลง canvas เป็น Data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageDataUrl);
    
    // หยุดการทำงานของกล้อง
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraReady(false);
    }
  };
  
  // ล้างภาพที่ถ่ายและเริ่มกล้องใหม่
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };
  
  // ยืนยันการใช้ภาพที่ถ่าย
  const confirmImage = () => {
    if (!capturedImage) return;
    
    // แปลง Data URL เป็น Blob และสร้าง File
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

  // เริ่มกล้องเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    startCamera();
    
    // ทำความสะอาดเมื่อคอมโพเนนต์ unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraFacing]); // ให้ useEffect ทำงานอีกครั้งเมื่อ cameraFacing เปลี่ยน

  return (
    <Card className="w-full max-w-xl mx-auto overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Video element สำหรับแสดงภาพจากกล้อง */}
          <div className={cn("aspect-video w-full", capturedImage || !isCameraReady ? 'hidden' : '')}>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* แสดงภาพที่ถ่ายแล้ว */}
          {capturedImage && (
            <div className="aspect-video w-full">
              <img 
                src={capturedImage} 
                alt="Captured receipt" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          {/* แสดงข้อความรอระหว่างกล้องกำลังโหลด */}
          {!isCameraReady && !capturedImage && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
              <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
              <p className="text-white">กำลังเปิดกล้อง...</p>
            </div>
          )}
          
          {/* แสดงข้อผิดพลาดถ้าไม่สามารถเข้าถึงกล้องได้ */}
          {cameraError && (
            <div className="aspect-video w-full flex items-center justify-center bg-gray-100">
              <div className="text-center p-4">
                <X className="h-10 w-10 text-red-500 mx-auto mb-2" />
                <p className="text-gray-700">{cameraError}</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={startCamera}
                >
                  ลองอีกครั้ง
                </Button>
              </div>
            </div>
          )}
          
          {/* Canvas element สำหรับจับภาพหน้าจอ (ซ่อนไว้) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* ปุ่มควบคุม */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            {!capturedImage ? (
              <>
                {/* ปุ่มสลับกล้อง */}
                <Button 
                  variant="secondary"
                  size="icon" 
                  className="rounded-full w-12 h-12 bg-white/80 hover:bg-white"
                  onClick={switchCamera}
                  disabled={!isCameraReady || isProcessing}
                >
                  <RotateCw className="h-6 w-6" />
                </Button>
                
                {/* ปุ่มถ่ายภาพ */}
                <Button 
                  variant="outline"
                  size="icon" 
                  className="rounded-full w-14 h-14 bg-white hover:bg-white border-2 border-primary"
                  onClick={captureImage}
                  disabled={!isCameraReady || isProcessing}
                >
                  <Camera className="h-8 w-8 text-primary" />
                </Button>
                
                {/* ปุ่มยกเลิก */}
                <Button 
                  variant="secondary"
                  size="icon" 
                  className="rounded-full w-12 h-12 bg-white/80 hover:bg-white"
                  onClick={onCancel}
                  disabled={isProcessing}
                >
                  <X className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <>
                {/* ปุ่มลบและถ่ายใหม่ */}
                <Button 
                  variant="outline"
                  size="icon" 
                  className="rounded-full w-12 h-12 bg-white/80 hover:bg-white border-2 border-red-500"
                  onClick={retakePhoto}
                  disabled={isProcessing}
                >
                  <X className="h-6 w-6 text-red-500" />
                </Button>
                
                {/* ปุ่มยืนยันใช้ภาพนี้ */}
                <Button 
                  variant="outline"
                  size="icon" 
                  className="rounded-full w-14 h-14 bg-white hover:bg-white border-2 border-green-500"
                  onClick={confirmImage}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}