'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { deleteImageFromUrl, uploadImage } from '@/lib/supabase';
import { format, isValid, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import {
  Loader2, Info, ChevronDown, ChevronUp, XCircle, Check, Trash, Edit3, CreditCard,
  Receipt, FileWarning, AlertCircle, ArrowLeft, ScanLine, RefreshCw, Eye, Save, Tag,
  Clock, CalendarDays, FileText, ShoppingBasket, Store
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from '@/components/ui/tooltip';

import { Transaction } from '@/types';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useCategoryStore } from '@/store/categoryStore';
import ImageUploader from '@/app/components/ImageUploader';
import { formatCurrency } from '@/lib/utils';
import { DatePickerInput } from '@/components/ui/datepicker';
import api from '@/services/instance';

interface OcrScanResultData {
  amount: number;
  date: string | null;
  category?: string;
  description: string;
  merchant: string | null;
  items: Array<{ name: string; price: number }>;
  taxId?: string | null;
  rawText?: string;
  imageUrl?: string; 
}


interface ScanResultState extends OcrScanResultData {
  file: File;
  category: string;
}


export default function ReceiptScanner() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthUser();
  const { addTransaction } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [scanResults, setScanResults] = useState<ScanResultState[]>([]);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [scanningCompleted, setScanningCompleted] = useState(false);
  const [uploaderResetKey, setUploaderResetKey] = useState<string>('initial');

  const [helpDialogOpen, setHelpDialogOpen] = useState(false);


  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  const handleImagesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setScanResults([]);
    setScanningCompleted(false);
    setCurrentStep(1);
    setOverallProgress(0);
    setProcessingProgress(0);
  }, []);


  const toggleItems = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const startScanning = async () => {
    
    if (!isAuthenticated || !user?.id) {
      toast.error('กรุณาเข้าสู่ระบบก่อนสแกนใบเสร็จ');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('กรุณาเลือกรูปภาพอย่างน้อย 1 รูป');
      return;
    }
    const userId = user.id;
    setIsScanning(true);
    setProcessingProgress(0);
    setCurrentFileIndex(0);
    setScanningCompleted(false);
    setOverallProgress(0);
    const totalFiles = selectedFiles.length;
    const results: ScanResultState[] = [];

    try {
      for (let i = 0; i < totalFiles; i++) {
        setCurrentFileIndex(i);
        const file = selectedFiles[i];
        setProcessingProgress(5);

        let imageUrl: string | null = null;
        try {
          imageUrl = await uploadImage(file, userId);
          setProcessingProgress(20);
          if (!imageUrl) {
             toast.error(`(${i + 1}/${totalFiles}) ไม่สามารถอัปโหลด ${file.name}`);
             results.push({
                 file, amount: 0, date: format(new Date(), 'yyyy-MM-dd'), category: '',
                 description: `Error: Upload failed`, merchant: 'Error', items: [], taxId: null, imageUrl: URL.createObjectURL(file)
             });
             setOverallProgress(((i + 1) / totalFiles) * 100);
             continue;
          }
        } catch (uploadError) {
           console.error('Supabase upload error:', uploadError);
           toast.error(`(${i + 1}/${totalFiles}) อัปโหลด ${file.name} ล้มเหลว`);
           results.push({
                 file, amount: 0, date: format(new Date(), 'yyyy-MM-dd'), category: '',
                 description: `Error: Upload failed`, merchant: 'Error', items: [], taxId: null, imageUrl: URL.createObjectURL(file)
             });
           setOverallProgress(((i + 1) / totalFiles) * 100);
           continue;
        }

        try {
          setProcessingProgress(40);
          console.log(`Calling NestJS backend for OCR: ${imageUrl}`);
          const response = await fetch(`${api}/ocr/google-vision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: imageUrl })
          });

          setProcessingProgress(80);

          if (!response.ok) {
            let errorMsg = `API Error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch {}
            throw new Error(errorMsg);
          }

          const ocrData: OcrScanResultData = await response.json();
          console.log('Received parsed data from NestJS API:', ocrData);
          setProcessingProgress(90);

          let validDate = ocrData.date;
          try {
            if (!validDate || !/^\d{4}-\d{2}-\d{2}$/.test(validDate)) {
              const altFormatMatch = validDate?.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
              if (altFormatMatch) {
                const [, dd, mm, yyyy] = altFormatMatch;
                validDate = `${yyyy}-${mm}-${dd}`;
              }
            }
          
            if (!validDate || !/^\d{4}-\d{2}-\d{2}$/.test(validDate)) {
              validDate = format(new Date(), 'yyyy-MM-dd');
            }
          } catch  {
            validDate = format(new Date(), 'yyyy-MM-dd');
          }
          
          results.push({
            file,
            amount: ocrData.amount || 0,
            date: validDate,
            category: filteredCategories.length > 0 ? filteredCategories[0].name : '',
            description: ocrData.description || ocrData.merchant || `สแกนจาก ${file.name}`,
            merchant: ocrData.merchant || '',
            items: ocrData.items || [],
            taxId: ocrData.taxId,
            imageUrl
          });
          setProcessingProgress(100);

        } catch (apiError) {
          console.error(`Error processing file ${file.name} via API:`, apiError);
  
          let errorMessage = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
          if (apiError instanceof Error) {
              errorMessage = apiError.message;
          } else if (typeof apiError === 'string') {
              errorMessage = apiError;
          }
  
          toast.error(`(${i + 1}/${totalFiles}) วิเคราะห์ ${file.name} ล้มเหลว: ${errorMessage}`);
          setProcessingProgress(100);
          results.push({
               file, amount: 0, date: format(new Date(), 'yyyy-MM-dd'), category: '',
               description: `Error: ${errorMessage}`, merchant: 'Error Processing', items: [], taxId: null, imageUrl
           });
      }

        setOverallProgress(((i + 1) / totalFiles) * 100);
      }

      setScanResults(results);

      if (results.length > 0) {
        const successfulScans = results.filter(r => !r.merchant?.includes('Error')).length;
        if (successfulScans > 0) {
            toast.success(`สแกนใบเสร็จ ${successfulScans} รายการสำเร็จ (ตรวจสอบข้อมูลก่อนบันทึก)`);
        } else {
             toast.error(`การสแกน ${results.length} รายการ ล้มเหลวทั้งหมด หรือ ไม่พบข้อมูล`);
        }
        setScanningCompleted(true);
        setTimeout(() => {
          setCurrentStep(2);
        }, 500);
      } else {
        toast.error('ไม่สามารถประมวลผลไฟล์ที่เลือกได้');
        setScanningCompleted(false);
      }

    } catch (error) {
      console.error("Error during scanning process setup:", error);
      toast.error('เกิดข้อผิดพลาดในการเริ่มกระบวนการสแกน');
      setScanningCompleted(false);
    } finally {
      setIsScanning(false);
    }
  };

  // Update scan result field
  const updateScanResult = (
    index: number, 
    field: keyof ScanResultState, 
    value: ScanResultState[keyof ScanResultState]
  ) => {
    setScanResults(prev => {
      const updated = [...prev];
      if (field === 'amount') {
        updated[index] = { ...updated[index], [field]: parseFloat(value as string) || 0 };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Save transactions (Initiate confirmation)
  const saveTransactions = async () => {
    if (!isAuthenticated || !user?.id) {
      toast.error('กรุณาเข้าสู่ระบบก่อนบันทึกรายการ');
      return;
    }
    if (scanResults.some(r => r.merchant?.includes('Error'))) {
        toast.error('มีบางรายการที่เกิดข้อผิดพลาด โปรดแก้ไขหรือลบออกก่อนบันทึก');
        return;
    }
     if (scanResults.length === 0) {
         toast.error('ไม่มีรายการให้บันทึก');
         return;
     }

    setShowConfirmDialog(true);
  };

  const confirmSaveTransactions = async () => {
    if (!isAuthenticated || !user?.id) {
      toast.error('กรุณาเลือกผู้ใช้ก่อนบันทึกรายการ');
      setShowConfirmDialog(false);
      return;
    }

    setShowConfirmDialog(false);
    const toastId = toast.loading(`กำลังบันทึก ${scanResults.length} รายการ...`);

    try {
      const userId = user.id;
      const nowISO = new Date().toISOString();
      let savedCount = 0;
      for (const data of scanResults) {
        let transactionDateISO: string;

        if (data.date && typeof data.date === 'string' && data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            try {
                transactionDateISO = new Date(data.date).toISOString();
            } catch {
                console.warn(`Invalid date string found ('${data.date}'), using current date.`);
                transactionDateISO = nowISO;
            }
        } else {
            console.warn(`Date is missing or not in YYYY-MM-DD format ('${data.date}'), using current date.`);
            transactionDateISO = nowISO;
        }
        const newTransaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
          user_id: userId,
          amount: data.amount,
          type: transactionType,
          category: data.category,
          description: data.merchant || data.description || `สแกนจาก ${data.file.name}`,
          date: transactionDateISO,
          receipt_images: data.imageUrl ? [data.imageUrl] : []
        };
        await addTransaction(newTransaction);
        savedCount++;
      }
      toast.success(`บันทึกสำเร็จ ${savedCount} รายการ`, { id: toastId });
      // Reset state after successful save
      setSelectedFiles([]);
      setScanResults([]);
      setCurrentStep(1);
      setOverallProgress(0);
      setProcessingProgress(0);
      setScanningCompleted(false);

    } catch (error) {
      let errorMessage = 'Unknown error occurred during saving';
      if (error instanceof Error) {
          errorMessage = error.message;
      } else if (typeof error === 'string') {
          errorMessage = error;
      }

      console.error("Error saving transactions:", error);
      toast.error(`เกิดข้อผิดพลาดขณะบันทึก: ${errorMessage}`, { id: toastId });
  } finally {
    }
  };
  const handleResetScan = async () => {
    await Promise.all(scanResults.map(async (r) => {
      if (r.imageUrl && !r.imageUrl.startsWith('blob:')) {
        await deleteImageFromUrl(r.imageUrl);
      }
    }));
  
    // ล้างทุก state
    setSelectedFiles([]);
    setScanResults([]);
    setCurrentStep(1);
    setOverallProgress(0);
    setProcessingProgress(0);
    setScanningCompleted(false);
  
    setUploaderResetKey(Date.now().toString());
  };
  
  // Remove a scan result card
  const removeResult = (index: number) => {
    setScanResults(prev => prev.filter((_, i) => i !== index));

    if (scanResults.length === 1) {
         setTimeout(() => setCurrentStep(1), 100);
    }
  };

  // Loading state for authentication
  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary/70" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-amber-500 opacity-80" />
          <h2 className="text-xl font-semibold mb-2">ต้องเข้าสู่ระบบก่อน</h2>
          <p className="text-muted-foreground mb-4">คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถสแกนใบเสร็จได้</p>
          <Button className="mx-auto" onClick={() => signIn('google')}>
            <FcGoogle className="mr-2 h-5 w-5" />
            เข้าสู่ระบบด้วย Google
          </Button>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header with steps indicator */}
      <div className="mb-6">
        {/* Title and Type Selection */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center">
              <ScanLine className="mr-2 h-5 w-5 text-primary" />
              สแกนใบเสร็จ
            </h2>
            <p className="text-sm text-muted-foreground mt-1">อัปโหลดรูปใบเสร็จ ระบบจะวิเคราะห์และเพิ่มรายการให้</p>
          </div>
           {/* Transaction type selection */}
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

        {/* Step indicator */}
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
              resetKey={uploaderResetKey}
            />
            </div>


            {/* Scanning progress */}
            {isScanning && selectedFiles.length > 0 && (
              <div className="px-4 md:px-6 py-4 bg-muted/10 border-t">
                 {/* Overall Progress */}
                 <div className="mb-3">
                     <div className="flex justify-between text-xs text-muted-foreground mb-1">
                         <span>ความคืบหน้าโดยรวม ({currentFileIndex + 1}/{selectedFiles.length})</span>
                         <span>{Math.round(overallProgress)}%</span>
                     </div>
                     <Progress value={overallProgress} className="h-1.5" />
                 </div>

                 {/* Current File Progress */}
                <div className="flex items-center gap-2 md:gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">
                      {processingProgress < 20 ? `กำลังอัปโหลด: ${selectedFiles[currentFileIndex]?.name}` : `กำลังวิเคราะห์: ${selectedFiles[currentFileIndex]?.name}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {processingProgress < 100 ? 'รอสักครู่...' : 'เสร็จสิ้นไฟล์นี้'}
                    </p>
                  </div>
                  <Badge variant={processingProgress < 100 ? "outline" : "default"} className="shrink-0">
                    {processingProgress}%
                  </Badge>
                </div>
                <Progress value={processingProgress} className="h-1 mt-2" />

              </div>
            )}

            {scanningCompleted && (
                 <div className="px-4 md:px-6 py-3 border-t">
                     <div className=" flex items-center gap-2 text-sm text-primary">
                         <Check className="h-4 w-4" />
                         <span>การสแกนเสร็จสมบูรณ์ ({scanResults.length} ผลลัพธ์) กำลังไปหน้าตรวจสอบ...</span>
                     </div>
                 </div>
             )}


          </CardContent>
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
                    <div>เคล็ดลับการสแกนใบเสร็จให้แม่นยำ</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            <div className="flex gap-2 w-full sm:w-auto">
                <Button
                    variant="outline"
                    onClick={handleResetScan}
                    disabled={selectedFiles.length === 0 || isScanning}
                    className="flex-1 sm:flex-none"
                >
                    ล้าง
                </Button>

              <Button
                onClick={startScanning}
                disabled={selectedFiles.length === 0 || isScanning}
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
        </Card>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Header for Review Step */}
           <Card>
             <CardHeader className="pb-3">
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                 <div>
                   <CardTitle className="flex items-center text-lg md:text-xl">
                     <Edit3 className="h-5 w-5 mr-2 text-primary" />
                     ตรวจสอบและแก้ไขผลสแกน
                   </CardTitle>
                   <CardDescription>
                     พบ {scanResults.length} รายการ โปรดตรวจสอบความถูกต้องก่อนบันทึก
                   </CardDescription>
                 </div>
                 <Badge variant="outline" className="px-3 py-1 self-start sm:self-auto">
                   <Clock className="h-3 w-3 mr-1" />
                   {format(new Date(), "d MMM yy", { locale: th })} 
                 </Badge>
               </div>
             </CardHeader>
           </Card>

          {/* Results Cards */}
          <div className="grid grid-cols-1 gap-6">
            {scanResults.map((result, index) => (
              <Card key={index} className={cn(
                  "transition-all",
                  result.merchant?.includes('Error') && "border-red-300 bg-red-50/30"
              )}>
                 <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                       <div className="flex items-start gap-3">
                         <div className="w-14 h-14 md:w-16 md:h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 relative">
                           {result.imageUrl ? (
                             <Image
                                src={result.imageUrl.startsWith('blob:') ? result.imageUrl : `${result.imageUrl}?t=${Date.now()}`}
                                alt={`Receipt ${index + 1}`}
                                fill
                                objectFit="cover"
                                className="object-cover w-full h-full"
                                onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                               />
                           ) : (
                             <div className="w-full h-full bg-muted flex items-center justify-center">
                               <Receipt className="h-6 w-6 text-muted-foreground opacity-50" />
                             </div>
                           )}
                           {result.imageUrl && (
                             <Button
                               variant="secondary"
                               size="icon"
                               className="absolute bottom-1 right-1 h-6 w-6 opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 text-white"
                               onClick={() => window.open(result.imageUrl, '_blank')}
                               title="ดูรูปภาพเต็ม"
                             >
                               <Eye className="h-3 w-3" />
                             </Button>
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                             <h3 className="font-medium truncate">
                               {result.merchant || `ใบเสร็จ ${index + 1}`}
                               {result.merchant?.includes('Error') && <span className="text-red-600 ml-2">(Error)</span>}
                             </h3>


                             <Badge
                                 className={cn(
                                     "text-xs mt-1",
                                     transactionType === 'expense' ? "bg-red-100 text-red-800 hover:bg-red-200" : "bg-green-100 text-green-800 hover:bg-green-200"
                                 )}
                             >
                                 {transactionType === 'expense' ? 'รายจ่าย' : 'รายรับ'}
                             </Badge>

                             {result.taxId && (
                               <p className="text-xs text-muted-foreground mt-1 truncate" title={`Tax ID: ${result.taxId}`}>
                                 <span className="hidden xs:inline">Tax ID:</span> {result.taxId}
                               </p>
                             )}
                              <p className="text-xs text-muted-foreground mt-1">
                                วันที่: {
                                  result.date && isValid(parseISO(result.date))
                                    ? format(parseISO(result.date), 'EEEEที่ d MMMM yyyy', { locale: th })
                                    : '-'
                                }
                              </p>
                         </div>
                       </div>
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
                           <span className="hidden xs:inline">ลบ</span>
                         </Button>
                       </div>
                     </div>
                 </CardHeader>

                <CardContent className="pb-3 space-y-4 md:space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor={`amount-${index}`} className="flex items-center text-sm">
                         <CreditCard className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                         จำนวนเงิน <span className="text-red-500 ml-1">*</span>
                       </Label>
                       <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                           ฿
                         </span>
                         <Input
                           id={`amount-${index}`}
                           type="number"
                           value={result.amount}
                           onChange={(e) => updateScanResult(index, 'amount', e.target.value)}
                           placeholder="0.00"
                           step="0.01"
                           required
                           className="pl-8"
                         />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor={`date-${index}`} className="flex items-center text-sm">
                         <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                         วันที่ <span className="text-red-500 ml-1">*</span>
                       </Label>
                       <DatePickerInput
                          value={result.date}
                          onChange={(val) => updateScanResult(index, 'date', val)}
                          dateFormat="dd/MM/yyyy"
                          locale={th}
                        />
                     </div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor={`category-${index}`} className="flex items-center text-sm">
                         <Tag className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                         หมวดหมู่ <span className="text-red-500 ml-1">*</span>
                       </Label>
                       <Select
                         value={result.category}
                         onValueChange={(value) => updateScanResult(index, 'category', value)}
                         required
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="เลือกหมวดหมู่" />
                         </SelectTrigger>
                         <SelectContent>
                         {filteredCategories.length === 0 && (
                              <SelectItem value="no-category" disabled>
                                ไม่มีหมวดหมู่{transactionType === 'expense' ? 'รายจ่าย' : 'รายรับ'}
                              </SelectItem>
                            )}
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
                         value={result.merchant || ''}
                         onChange={(e) => updateScanResult(index, 'merchant', e.target.value)}
                         placeholder="ชื่อร้านค้า หรือ ผู้รับ/จ่าย"
                       />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor={`description-${index}`} className="flex items-center text-sm">
                       <FileText className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                       รายละเอียดเพิ่มเติม
                     </Label>
                     <Textarea
                       id={`description-${index}`}
                       value={result.description || ''}
                       onChange={(e) => updateScanResult(index, 'description', e.target.value)}
                       placeholder="เช่น ซื้อของใช้, ค่าอาหารกลางวัน"
                       className="resize-none min-h-[60px]"
                       rows={2}
                     />
                   </div>


                   {/* Items list */}
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
                               รวมยอดจากรายการ: {formatCurrency(result.items.reduce((total, item) => total + item.price, 0))}
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
                               ใช้ยอดรวมนี้
                             </Button>
                           </div>
                         </div>
                       )}
                     </div>
                   )}

                   {result.merchant?.includes('Error') && (
                       <div className="flex items-start md:items-center p-2 md:p-3 bg-red-100 text-red-700 rounded-md text-xs md:text-sm">
                           <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 md:mt-0" />
                           <span>เกิดข้อผิดพลาดในการประมวลผลใบเสร็จนี้ โปรดตรวจสอบข้อมูล หรือ ลบรายการนี้</span>
                       </div>
                   )}

                </CardContent>
              </Card>
            ))}
          </div>

          {/* No results message */}
          {scanResults.length === 0 && scanningCompleted && (
            <div className="text-center py-8 md:py-12">
              <FileWarning className="h-10 md:h-12 w-10 md:w-12 mx-auto text-muted-foreground opacity-20" />
              <p className="mt-4 text-muted-foreground">ไม่พบผลการสแกนที่สำเร็จ</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับไปอัปโหลดใหม่
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
                กลับไปอัปโหลด
              </Button>

              <Button
                onClick={saveTransactions}
                disabled={scanResults.length === 0 || isScanning || scanResults.some(r => r.merchant?.includes('Error'))}
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
                    บันทึก ({scanResults.filter(r=> !r.merchant?.includes('Error')).length}) รายการ
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )} {/* End Step 2 */}


      {/* Help Dialog */}
       <AlertDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
         <AlertDialogContent className="max-w-md md:max-w-xl">
           <AlertDialogHeader>
             <AlertDialogTitle>เคล็ดลับการสแกนใบเสร็จ</AlertDialogTitle>
           </AlertDialogHeader>
           <div className="space-y-4 py-2 text-sm">
             <div className="flex gap-3">
               <div className="bg-primary/10 text-primary p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 font-medium">1</div>
               <div><strong className="font-medium">ถ่ายภาพให้ชัดเจน:</strong> ถ่ายในที่สว่างเพียงพอ ให้ภาพคมชัด ไม่มีเงาหรือแสงสะท้อน</div>
             </div>
             <div className="flex gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 font-medium">2</div>
               <div><strong className="font-medium">จัดวางให้ตรง:</strong> วางใบเสร็จบนพื้นเรียบ ให้ตรงและเต็มกรอบภาพ ไม่บิดเบี้ยวหรือพับงอ</div>
             </div>
             <div className="flex gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 font-medium">3</div>
               <div><strong className="font-medium">ตรวจสอบข้อมูลเสมอ:</strong> หลังสแกน ควรตรวจสอบความถูกต้องของ จำนวนเงิน, วันที่, ร้านค้า และรายละเอียดอื่นๆ ก่อนบันทึกเสมอ</div>
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
             <AlertDialogTitle>ยืนยันการบันทึก</AlertDialogTitle>
             <AlertDialogDescription>
               คุณต้องการบันทึกรายการทั้งหมด {scanResults.length} รายการใช่หรือไม่?
               {transactionType === 'expense' ? (
                 <span className="mt-2 font-medium text-red-600">
                   ยอดรวมรายจ่าย: {formatCurrency(scanResults.reduce((total, result) => total + result.amount, 0))}
                 </span>
               ) : (
                 <span className="mt-2 font-medium text-green-600">
                   ยอดรวมรายรับ: {formatCurrency(scanResults.reduce((total, result) => total + result.amount, 0))}
                 </span>
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
               ยืนยันบันทึก
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

    </div>
  );
}