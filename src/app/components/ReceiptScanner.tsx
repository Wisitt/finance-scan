'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '@/store/userStore';
import { useTransactionStore } from '@/store/transactionStore';
import { scanReceipt, detectReceipts, loadModel } from '@/lib/ocr';
import { supabase, uploadImage } from '@/lib/supabase';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import ImageUploader from './ImageUploader';
import { cn } from '@/lib/utils';

import { 
  Loader2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  XCircle, 
  Check, 
  Trash, 
  Edit3, 
  CreditCard,
  Receipt,
  FileWarning,
  AlertCircle,
  ArrowLeft,
  ScanLine,
  RefreshCw,
  Eye,
  Save,
  Tag,
  Clock,
  CalendarDays,
  FileText,
  ShoppingBasket,
  Store
} from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Transaction } from '@/types';

import toast from 'react-hot-toast';

export default function ReceiptScanner() {
  const { currentUser } = useUserStore();
  const { categories, addTransaction } = useTransactionStore();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [scanResults, setScanResults] = useState<{
    file: File;
    amount: number;
    date: string;
    category: string;
    description: string;
    merchant: string;
    items: Array<{name: string, price: number}>;
    taxId?: string;
    confidence: number;
    imageUrl?: string;
  }[]>([]);
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [scanningCompleted, setScanningCompleted] = useState(false);
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  
  // Filter categories by transaction type
  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  // Simulate model loading progress
  useEffect(() => {
    if (modelLoadingProgress < 100 && !modelLoaded) {
      const timer = setTimeout(() => {
        setModelLoadingProgress(prev => Math.min(prev + 15, 95));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [modelLoadingProgress, modelLoaded]);

  // Preload TensorFlow.js model
  useEffect(() => {
    const preloadModel = async () => {
      try {
        setModelLoadingProgress(10);
        await loadModel();
        setModelLoadingProgress(100);
        setModelLoaded(true);
        console.log('TensorFlow model preloaded successfully');
      } catch (error) {
        console.error('Error preloading model:', error);
        // Still set modelLoaded to true to allow the app to function
        setModelLoadingProgress(100);
        setModelLoaded(true);
      }
    };
    
    preloadModel();
  }, []);
  
  // Handle file upload
  const handleImagesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setScanResults([]);
    setScanningCompleted(false);
  }, []);
  
  // Toggle items visibility for a receipt
  const toggleItems = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };
  
  // Start scanning all receipt images
  const startScanning = async () => {
    if (!currentUser) {
      toast.error('กรุณาเลือกผู้ใช้ก่อนสแกนใบเสร็จ');
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast.error('กรุณาเลือกรูปภาพอย่างน้อย 1 รูป');
      return;
    }
    const userId = currentUser.id;
    setIsScanning(true);
    setProcessingProgress(0);
    setCurrentFileIndex(0);
    setScanningCompleted(false);
    
    try {
      const results = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        setCurrentFileIndex(i);
        const file = selectedFiles[i];
        
        // Upload image to Supabase Storage
        setProcessingProgress(5);
        const imageUrl = await uploadImage(file, userId);
        setProcessingProgress(15);
        
        if (!imageUrl) {
          toast.error(`ไม่สามารถอัปโหลดรูปภาพ ${file.name} ได้`);
          continue;
        }
        
        try {
          // Check if the image is a receipt
          setProcessingProgress(20);
          const isReceipt = await detectReceipts(imageUrl);
          setProcessingProgress(40);
          
          if (!isReceipt) {
            toast.error(`รูปภาพ ${file.name} อาจไม่ใช่ใบเสร็จ แต่จะดำเนินการต่อ`);
          }
        } catch (error) {
          console.error("Receipt detection error:", error);
          // Continue processing even if detection fails
        }
        
        // Scan receipt with enhanced OCR
        setProcessingProgress(50);
        const ocrResult = await scanReceipt(file);
        setProcessingProgress(80);
        
        // Format date or use current date
        const today = new Date();
        const formattedDate = ocrResult.date || format(today, 'yyyy-MM-dd');
        
        // Create result
        results.push({
          file,
          amount: ocrResult.amount,
          date: formattedDate,
          category: filteredCategories.length > 0 ? filteredCategories[0].name : '',
          description: ocrResult.details ? ocrResult.details.substring(0, 100) : '',
          merchant: ocrResult.merchant || '',
          items: ocrResult.items || [],
          taxId: ocrResult.tax_id,
          confidence: ocrResult.confidence,
          imageUrl
        });
        
        // Update progress
        setProcessingProgress(100);
      }
      
      setScanResults(results);
      
      if (results.length > 0) {
        toast.success(`สแกนใบเสร็จสำเร็จ ${results.length} รายการ`);
        setScanningCompleted(true);
        setTimeout(() => {
          setCurrentStep(2);
        }, 800);
      } else {
        toast.error('ไม่พบข้อมูลในใบเสร็จที่สแกน');
        setScanningCompleted(false);
      }
      
    } catch (error) {
      console.error("Error scanning receipts:", error);
      toast.error('เกิดข้อผิดพลาดขณะสแกนใบเสร็จ');
      setScanningCompleted(false);
    } finally {
      setIsScanning(false);
    }
  };
  
  // Update scan result field
  const updateScanResult = (index: number, field: string, value: string | number | Array<{name: string, price: number}>) => {
    setScanResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  
  // Save transactions
  const saveTransactions = async () => {
    if (!currentUser) {
      toast.error('กรุณาเลือกผู้ใช้ก่อนบันทึกรายการ');
      return;
    }
    
    setShowConfirmDialog(true);
  };
  
  // Confirm saving transactions
  const confirmSaveTransactions = async () => {
    if (!currentUser) {
      toast.error('กรุณาเลือกผู้ใช้ก่อนบันทึกรายการ');
      return;
    }
    
    setShowConfirmDialog(false);
    setIsScanning(true);
    
    try {
      // Check if user exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (userError || !userData) {
        toast.error('ไม่พบข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง');
        setIsScanning(false);
        return;
      }
      
      for (const result of scanResults) {
        // Create new transaction
        const newTransaction = {
          user_id: userData.id,
          amount: result.amount,
          type: transactionType,
          category: result.category,
          description: result.merchant || result.description,
          date: result.date,
          receipt_images: result.imageUrl ? [result.imageUrl] : []
        };
        
        // Save transaction
        await addTransaction(newTransaction as Omit<Transaction, 'id'>);
      }
      toast.success(`บันทึกรายการสำเร็จ ${scanResults.length} รายการ`);
      // Reset state
      setSelectedFiles([]);
      setScanResults([]);
      setCurrentStep(1);
      
    } catch (error) {
      console.error("Error saving transactions:", error);
      toast.error('เกิดข้อผิดพลาดขณะบันทึกรายการ');
    } finally {
      setIsScanning(false);
    }
  };
  
  // Remove a scan result
  const removeResult = (index: number) => {
    setScanResults(prev => prev.filter((_, i) => i !== index));
    
    if (scanResults.length <= 1) {
      // If removing the last result, go back to step 1
      setCurrentStep(1);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get confidence level color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Get confidence level label
  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'สูง';
    if (confidence >= 0.6) return 'ปานกลาง';
    return 'ต่ำ';
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header with steps indicator */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center">
              <ScanLine className="mr-2 h-5 w-5 text-primary" />
              สแกนใบเสร็จ
            </h2>
            <p className="text-sm text-muted-foreground mt-1">สแกนใบเสร็จและเพิ่มรายการธุรกรรมอัตโนมัติ</p>
          </div>
          
          {/* Transaction type selection - make it full width on mobile */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <p className="text-sm text-muted-foreground mr-1 whitespace-nowrap hidden xs:inline">ประเภท:</p>
            <Tabs value={transactionType} className="w-full sm:w-[180px]" onValueChange={(value) => setTransactionType(value as 'expense' | 'income')}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="expense" className={cn(
                  transactionType === 'expense' && "data-[state=active]:bg-red-50 data-[state=active]:text-red-600"
                )}>
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                  รายจ่าย
                </TabsTrigger>
                <TabsTrigger value="income" className={cn(
                  transactionType === 'income' && "data-[state=active]:bg-green-50 data-[state=active]:text-green-600"
                )}>
                  <Receipt className="h-3.5 w-3.5 mr-1.5" />
                  รายรับ
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Step indicator - simplified for mobile */}
        <div className="relative mt-8">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2" />
          <div className="flex justify-between relative">
            <div className={cn(
              "flex flex-col items-center relative z-10",
              currentStep >= 1 ? "text-primary" : "text-muted-foreground"
            )}>
              <div className={cn(
                "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white mb-1",
                currentStep >= 1 ? "bg-primary" : "bg-muted",
              )}>
                {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="text-xs font-medium">อัปโหลด</span>
            </div>
            
            <div className={cn(
              "flex flex-col items-center relative z-10",
              currentStep >= 2 ? "text-primary" : "text-muted-foreground"
            )}>
              <div className={cn(
                "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white mb-1",
                currentStep >= 2 ? "bg-primary" : "bg-muted"
              )}>
                {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <span className="text-xs font-medium">ตรวจสอบ</span>
            </div>
            
            <div className={cn(
              "flex flex-col items-center relative z-10",
              currentStep >= 3 ? "text-primary" : "text-muted-foreground"
            )}>
              <div className={cn(
                "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white mb-1",
                currentStep >= 3 ? "bg-primary" : "bg-muted"
              )}>
                3
              </div>
              <span className="text-xs font-medium">บันทึก</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Step 1: Upload Images */}
      {currentStep === 1 && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 md:p-6 pb-0">
              <ImageUploader 
                onImagesSelected={handleImagesSelected} 
                isProcessing={isScanning} 
                maxFiles={100}
              />
            </div>
            
            {/* Model loading indicator */}
            {!modelLoaded && (
              <div className="px-4 md:px-6 py-3">
                <div className="bg-muted/20 rounded-md p-3 md:p-4 flex items-start">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 md:mr-3 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-2 w-full">
                    <p className="text-sm font-medium">กำลังโหลด AI สำหรับวิเคราะห์ใบเสร็จ</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>โหลดโมเดล TensorFlow.js</span>
                        <span>{modelLoadingProgress}%</span>
                      </div>
                      <Progress value={modelLoadingProgress} className="h-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scanning progress */}
            {isScanning && (
              <div className="px-4 md:px-6 py-4 bg-muted/10">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        กำลังสแกนรูปภาพ {currentFileIndex + 1} จาก {selectedFiles.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {processingProgress < 100 ? 'กำลังประมวลผล...' : 'การสแกนเสร็จสิ้น'}
                      </p>
                    </div>
                    <Badge variant={processingProgress < 100 ? "outline" : "default"}>
                      {processingProgress}%
                    </Badge>
                  </div>
                  
                  <Progress value={processingProgress} className="h-1.5" />
                  
                  {processingProgress >= 80 && scanningCompleted && (
                    <div className="pt-1 flex items-center gap-2 text-sm text-primary">
                      <Check className="h-4 w-4" />
                      <span>การสแกนเสร็จสมบูรณ์ กำลังเตรียมผลลัพธ์...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 p-4 md:p-6 border-t">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button variant="outline" size="sm" onClick={() => setHelpDialogOpen(true)}>
                        <Info className="h-4 w-4 mr-1" />
                        วิธีใช้
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>เคล็ดลับการสแกนใบเสร็จให้แม่นยำ</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedFiles([]);
                    setScanResults([]);
                  }}
                  disabled={selectedFiles.length === 0 || isScanning}
                  className="flex-1 sm:flex-none"
                >
                  ล้าง
                </Button>
                
                <Button 
                  onClick={startScanning} 
                  disabled={selectedFiles.length === 0 || isScanning || !modelLoaded}
                  className={cn(
                    "min-w-[120px] transition-all flex-1 sm:flex-none",
                    transactionType === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  )}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="sm:hidden">กำลังสแกน...</span>
                      <span className="hidden sm:inline">กำลังสแกน...</span>
                    </>
                  ) : !modelLoaded ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      รอสักครู่...
                    </>
                  ) : (
                    <>
                      <ScanLine className="mr-2 h-4 w-4" />
                      <span className="sm:hidden">เริ่มสแกน</span>
                      <span className="hidden sm:inline">เริ่มสแกน {selectedFiles.length > 0 && `(${selectedFiles.length})`}</span>
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Edit and review results */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <Edit3 className="h-5 w-5 mr-2 text-primary" />
                    ตรวจสอบผลสแกน
                  </CardTitle>
                  <CardDescription>
                    ตรวจสอบและแก้ไขข้อมูลใบเสร็จ {scanResults.length} รายการ
                  </CardDescription>
                </div>
                <Badge variant="outline" className="px-3 py-1 self-start sm:self-auto">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(), "d MMM yyyy", { locale: th })}
                </Badge>
              </div>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 gap-6">
            {scanResults.map((result, index) => (
              <Card key={index} className={cn(
                "transition-all",
                result.confidence < 0.6 && "border-red-200"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 relative">
                        {result.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={result.imageUrl}
                            alt={`Receipt ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Receipt className="h-6 w-6 text-muted-foreground opacity-50" />
                          </div>
                        )}
                        
                        {/* Zoom button */}
                        {result.imageUrl && (
                          <Button 
                            variant="secondary" 
                            size="icon"
                            className="absolute bottom-1 right-1 h-6 w-6 opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => window.open(result.imageUrl, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium truncate">
                            {result.merchant || `ใบเสร็จ ${index + 1}`}
                          </h3>
                          <div className="flex gap-1.5 flex-wrap">
                            {/* Confidence badge */}
                            <Badge 
                              variant="outline" 
                              className="font-normal text-xs border-none bg-muted/50"
                            >
                              <div className={cn(
                                "w-2 h-2 rounded-full mr-1",
                                getConfidenceColor(result.confidence)
                              )} />
                              <span className="hidden xs:inline">ความแม่นยำ</span> {getConfidenceLabel(result.confidence)}
                            </Badge>
                            
                            {/* Transaction type badge */}
                            <Badge 
                              className={cn(
                                "text-xs",
                                transactionType === 'expense' ? "bg-red-100 text-red-800 hover:bg-red-200" : "bg-green-100 text-green-800 hover:bg-green-200"
                              )}
                            >
                              {transactionType === 'expense' ? 'รายจ่าย' : 'รายรับ'}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Tax ID if available */}
                        {result.taxId && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            <span className="hidden xs:inline">เลขประจำตัวผู้เสียภาษี:</span> {result.taxId}
                          </p>
                        )}
                        
                        {/* Date display */}
                        <p className="text-xs text-muted-foreground mt-1">
                          วันที่: {format(new Date(result.date), "d MMM yyyy", { locale: th })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Amount display */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 mt-1 sm:mt-0">
                      <div className={cn(
                        "text-lg md:text-xl font-bold",
                        transactionType === 'expense' ? "text-red-600" : "text-green-600"
                      )}>
                        {formatCurrency(result.amount)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeResult(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                      >
                        <Trash className="h-3.5 w-3.5 mr-1.5" />
                        <span className="hidden xs:inline">ลบรายการ</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3 space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`amount-${index}`} className="flex items-center text-sm">
                        <CreditCard className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        จำนวนเงิน
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ฿
                        </span>
                        <Input
                          id={`amount-${index}`}
                          type="number"
                          value={result.amount}
                          onChange={(e) => updateScanResult(index, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="จำนวนเงิน"
                          step="0.01"
                          className="pl-8"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`date-${index}`} className="flex items-center text-sm">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        วันที่
                      </Label>
                      <Input
                        id={`date-${index}`}
                        type="date"
                        value={result.date}
                        onChange={(e) => updateScanResult(index, 'date', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`category-${index}`} className="flex items-center text-sm">
                        <Tag className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        หมวดหมู่
                      </Label>
                      <Select
                        value={result.category}
                        onValueChange={(value) => updateScanResult(index, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกหมวดหมู่" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`merchant-${index}`} className="flex items-center text-sm">
                        <Store className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        ร้านค้า/ผู้ขาย
                      </Label>
                      <Input
                        id={`merchant-${index}`}
                        value={result.merchant}
                        onChange={(e) => updateScanResult(index, 'merchant', e.target.value)}
                        placeholder="ชื่อร้านค้า"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`} className="flex items-center text-sm">
                      <FileText className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      รายละเอียด
                    </Label>
                    <Textarea
                      id={`description-${index}`}
                      value={result.description}
                      onChange={(e) => updateScanResult(index, 'description', e.target.value)}
                      placeholder="รายละเอียดรายการ"
                      className="resize-none min-h-[60px] md:min-h-[80px]"
                    />
                  </div>
                  
                  {/* Items list - with responsive table */}
                  {result.items && result.items.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleItems(index)}
                        className="flex w-full items-center justify-between p-2 md:p-3 text-left text-sm font-medium hover:bg-muted/30"
                      >
                        <span className="flex items-center">
                          <ShoppingBasket className="h-4 w-4 mr-2 text-muted-foreground" />
                          รายการสินค้า ({result.items.length})
                        </span>
                        {expandedItems.includes(index) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      
                      {expandedItems.includes(index) && (
                        <div className="p-2 md:p-3 border-t bg-muted/10">
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground grid grid-cols-10 xs:grid-cols-12 gap-2 font-medium border-b pb-2">
                              <div className="col-span-6 xs:col-span-7">รายการ</div>
                              <div className="text-right col-span-2 xs:col-span-3">ราคา</div>
                              <div className="col-span-2"></div>
                            </div>
                            {result.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="grid grid-cols-10 xs:grid-cols-12 gap-2 text-xs md:text-sm items-center">
                                <div className="col-span-6 xs:col-span-7 truncate" title={item.name}>{item.name}</div>
                                <div className="text-right col-span-2 xs:col-span-3">{formatCurrency(item.price)}</div>
                                <div className="col-span-2 flex justify-end">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updatedItems = [...result.items];
                                      updatedItems.splice(itemIndex, 1);
                                      updateScanResult(index, 'items', updatedItems);
                                    }}
                                    title="ลบรายการ"
                                  >
                                    <XCircle className="h-3 md:h-4 w-3 md:w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mt-3 pt-2 border-t gap-2">
                            <div className="text-xs md:text-sm font-medium">
                              รวมทั้งหมด: {formatCurrency(result.items.reduce((total, item) => total + item.price, 0))}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 w-full xs:w-auto"
                              onClick={() => updateScanResult(index, 'amount', 
                                result.items.reduce((total, item) => total + item.price, 0)
                              )}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              ใช้ยอดรวม
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Low confidence warning */}
                  {result.confidence < 0.6 && (
                    <div className="flex items-start md:items-center p-2 md:p-3 bg-red-50 text-red-700 rounded-md text-xs md:text-sm">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 md:mt-0" />
                      <span>ความแม่นยำในการสแกนต่ำ อาจต้องตรวจสอบและแก้ไขข้อมูลด้วยตนเอง</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* No results message */}
          {scanResults.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <FileWarning className="h-10 md:h-12 w-10 md:w-12 mx-auto text-muted-foreground opacity-20" />
              <p className="mt-4 text-muted-foreground">ไม่พบผลการสแกนใบเสร็จ</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับไปอัปโหลดใบเสร็จ
              </Button>
            </div>
          )}
          
          {/* Bottom action bar */}
          {scanResults.length > 0 && (
            <div className="flex flex-col xs:flex-row justify-between items-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={isScanning}
                className="w-full xs:w-auto order-2 xs:order-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                ย้อนกลับ
              </Button>
              
              <Button 
                onClick={saveTransactions}
                disabled={scanResults.length === 0 || isScanning}
                className={cn(
                  "min-w-[140px] w-full xs:w-auto order-1 xs:order-2",
                  transactionType === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                )}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    บันทึกรายการ ({scanResults.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Help Dialog */}
      <AlertDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <AlertDialogContent className="max-w-md md:max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>เคล็ดลับการสแกนใบเสร็จ</AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex gap-2 md:gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-full h-7 w-7 md:h-8 md:w-8 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium text-sm">ถ่ายภาพให้ชัดเจน</h4>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  ถ่ายรูปใบเสร็จในที่ที่มีแสงสว่างเพียงพอ และให้ภาพคมชัด ไม่มีเงาหรือแสงสะท้อน
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 md:gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-full h-7 w-7 md:h-8 md:w-8 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium text-sm">จัดวางใบเสร็จให้ตรง</h4>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  จัดวางใบเสร็จให้ตรงและเต็มกรอบภาพ ไม่บิดเบี้ยวหรือพับงอ
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 md:gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-full h-7 w-7 md:h-8 md:w-8 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium text-sm">ตรวจสอบข้อมูลหลังสแกน</h4>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  สแกนอาจไม่สมบูรณ์ 100% ควรตรวจสอบจำนวนเงิน วันที่ และรายละเอียดหลังการสแกนเสมอ
                </p>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogAction>เข้าใจแล้ว</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-sm sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>บันทึกรายการ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการบันทึกรายการทั้งหมด {scanResults.length} รายการใช่หรือไม่?
              {transactionType === 'expense' ? (
                <p className="mt-2 font-medium text-red-600">
                  ยอดรวมรายจ่าย: {formatCurrency(scanResults.reduce((total, result) => total + result.amount, 0))}
                </p>
              ) : (
                <p className="mt-2 font-medium text-green-600">
                  ยอดรวมรายรับ: {formatCurrency(scanResults.reduce((total, result) => total + result.amount, 0))}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSaveTransactions}
              className={cn(
                "w-full sm:w-auto",
                transactionType === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              )}
            >
              บันทึก
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}