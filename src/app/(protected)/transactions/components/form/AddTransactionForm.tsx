'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { format } from 'date-fns';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, LogIn, ArrowRight, CheckCircle, AlertCircle, TrendingDown, TrendingUp, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormProvider } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/utils';
import { Separator } from '@/components/ui/separator';
import { AmountInput } from './AmountInput';
import { CategorySelector } from './CategorySelector';

import { TransactionTypeSelector } from './TransactionTypeSelector';
import { useTransactionForm } from './useTransactionForm';
import { DateSelector } from './DateSelector';
import { DescriptionInput } from './DescriptionInput';
import { SubmitButton } from './SubmitButton';

// Form Components


export default function AddTransactionForm() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuthUser();
  const { 
    form, 
    transactionType,
    isSubmitting,
    filteredCategories,
    handleTransactionTypeChange,
    handleSubmit,
    formattedAmount,
    formState,
    resetForm
  } = useTransactionForm();

  if (authLoading) {
    return <LoadingCard />;
  }
  
  if (!isAuthenticated) {
    return <LoginCard />;
  }
  
  const amountValue = form.watch('amount');
  const categoryValue = form.watch('category');
  const dateValue = form.watch('date');
  const descriptionValue = form.watch('description');
  
  const hasRequiredFields = amountValue && categoryValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className={cn(
        "w-full shadow-xl border-t-4 overflow-hidden transition-all duration-300",
        transactionType === 'expense' 
          ? "border-t-red-500" 
          : "border-t-green-500"
      )}>
        <CardHeader className={cn(
          "space-y-1 transition-colors duration-300 pb-4",
          transactionType === 'expense' ? "bg-red-50/50" : "bg-green-50/50"
        )}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-full",
                transactionType === 'expense' ? "bg-red-100" : "bg-green-100"
              )}>
                {transactionType === 'expense' 
                  ? <TrendingDown className="h-5 w-5 text-red-600" /> 
                  : <TrendingUp className="h-5 w-5 text-green-600" />
                }
              </div>
              <CardTitle className="text-xl font-bold">
                {transactionType === 'expense' ? 'เพิ่มรายจ่าย' : 'เพิ่มรายรับ'}
              </CardTitle>
            </div>
            
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }} 
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="font-normal bg-white/80 backdrop-blur-sm shadow-sm">
                {format(new Date(), 'dd MMM yyyy')}
              </Badge>
            </motion.div>
          </div>
          <p className="text-sm text-muted-foreground">
            {transactionType === 'expense' 
              ? 'บันทึกรายจ่ายใหม่ของคุณเพื่อติดตามการใช้จ่าย' 
              : 'บันทึกรายรับใหม่ของคุณเพื่อติดตามรายได้'}
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-5">
                <TransactionTypeSelector 
                  value={transactionType} 
                  onChange={handleTransactionTypeChange} 
                />

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <AmountInput 
                    form={form} 
                    transactionType={transactionType} 
                  />
                </div>

                <CategorySelector 
                  form={form} 
                  categories={filteredCategories} 
                  transactionType={transactionType}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <DateSelector 
                    form={form} 
                    transactionType={transactionType} 
                  />
                  
                  <DescriptionInput 
                    form={form} 
                    transactionType={transactionType} 
                  />
                </div>
              </div>

              {/* Transaction Preview */}
              <AnimatePresence>
                {hasRequiredFields && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={cn(
                      "p-4 rounded-md text-sm",
                      transactionType === 'expense' ? "bg-red-50/70" : "bg-green-50/70",
                      "border",
                      transactionType === 'expense' ? "border-red-100" : "border-green-100"
                    )}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ReceiptText className={cn(
                          "h-4 w-4",
                          transactionType === 'expense' ? "text-red-500" : "text-green-500"
                        )} />
                        <p className="font-medium">สรุปรายการ</p>
                      </div>
                      
                      <Separator className={cn(
                        "my-2", 
                        transactionType === 'expense' ? "bg-red-200/50" : "bg-green-200/50"
                      )} />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">หมวดหมู่:</span>
                          <span className="font-medium">{categoryValue}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">จำนวน:</span>
                          <span className={cn(
                            "font-bold",
                            transactionType === 'expense' ? "text-red-600" : "text-green-600"
                          )}>
                            {transactionType === 'expense' ? '-' : '+'}{formattedAmount || `฿${amountValue}`}
                          </span>
                        </div>
                        
                        {dateValue && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">วันที่:</span>
                            <span>{format(new Date(dateValue), 'dd MMM yyyy')}</span>
                          </div>
                        )}
                        
                        {descriptionValue && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">รายละเอียด:</span>
                            <span className="truncate max-w-[200px] text-right">{descriptionValue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col space-y-3">
                <SubmitButton 
                  transactionType={transactionType} 
                  isSubmitting={isSubmitting} 
                />
                
                {formState.isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm",
                      "bg-green-50 text-green-700 border border-green-100"
                    )}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>บันทึกรายการสำเร็จ</span>
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-green-700 font-medium ml-2" 
                      onClick={resetForm}
                    >
                      บันทึกรายการใหม่
                    </Button>
                  </motion.div>
                )}
                
                {formState.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-100"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>เกิดข้อผิดพลาด: {formState.error}</span>
                  </motion.div>
                )}
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
      
      {/* Quick Actions Footer */}
      <div className="flex justify-center mt-4">
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          ดูประวัติรายการ
        </Button>
        <Separator orientation="vertical" className="mx-2 h-4 self-center" />
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          ตั้งค่าหมวดหมู่
        </Button>
      </div>
    </motion.div>
  );
}

const LoadingCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="w-full max-w-lg mx-auto"
  >
    <Card className="w-full shadow-lg overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-100">
      <CardContent className="p-10 flex flex-col items-center justify-center min-h-[350px] space-y-4">
        <div className="relative flex flex-col items-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
          <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="mt-6"
          >
            <p className="text-muted-foreground animate-pulse">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const LoginCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="w-full max-w-lg mx-auto"
  >
    <Card className="w-full shadow-xl overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <h2 className="text-2xl font-bold mb-2">ยินดีต้อนรับ</h2>
            <p className="text-blue-100 mb-2">เข้าสู่ระบบเพื่อจัดการรายรับรายจ่ายของคุณ</p>
          </motion.div>
        </div>
        
        <div className="p-8 flex flex-col items-center bg-gradient-to-b from-white to-slate-50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-full p-4 -mt-12 shadow-lg mb-4 border border-blue-100"
          >
            <LogIn className="h-8 w-8 text-blue-600" />
          </motion.div>
          
          <p className="mb-6 text-center">กรุณาเข้าสู่ระบบเพื่อเพิ่มและจัดการรายการของคุณ</p>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full"
          >
            <Button 
              onClick={() => signIn('google')} 
              size="lg" 
              className="font-medium w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-gray-800 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              เข้าสู่ระบบด้วย Google
            </Button>
          </motion.div>
          
          <div className="flex items-center gap-2 mt-8">
            <p className="text-xs text-muted-foreground">
              ต้องการความช่วยเหลือ?
            </p>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs flex items-center gap-1">
              <span>ติดต่อผู้ดูแลระบบ</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            ระบบนี้ใช้ Google บัญชีของคุณเพื่อการยืนยันตัวตนและปกป้องข้อมูลส่วนบุคคล
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);