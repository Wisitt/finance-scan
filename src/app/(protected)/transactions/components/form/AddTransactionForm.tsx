'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { format } from 'date-fns';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AmountInput } from './AmountInput';
import { CategorySelector } from './CategorySelector';
import SubmitButton from './SubmitButton';
import { TransactionTypeSelector } from './TransactionTypeSelector';
import { useTransactionForm } from './useTransactionForm';
import { FormProvider } from 'react-hook-form';
import DateSelector from './DateSelector';
import DescriptionInput from './DescriptionInput';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/utils';

export default function AddTransactionForm() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuthUser();
  const { 
    form, 
    transactionType,
    isSubmitting,
    filteredCategories,
    handleTransactionTypeChange,
    handleSubmit,
    formattedAmount
  } = useTransactionForm();

  if (authLoading) {
    return <LoadingCard />;
  }
  
  if (!isAuthenticated) {
    return <LoginCard />;
  }
  
  const amountValue = form.watch('amount');
  const categoryValue = form.watch('category');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className={cn(
        "w-full shadow-lg border-t-4 overflow-hidden transition-all duration-300",
        transactionType === 'expense' 
          ? "border-t-red-500" 
          : "border-t-green-500"
      )}>
        <CardHeader className={cn(
          "space-y-1 transition-colors duration-300",
          transactionType === 'expense' ? "bg-red-50/50" : "bg-green-50/50"
        )}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-2xl font-bold">
              {transactionType === 'expense' ? '🛒 เพิ่มรายจ่าย' : '💰 เพิ่มรายรับ'}
            </CardTitle>
            <Badge variant="outline" className="font-normal bg-white/80 backdrop-blur-sm">
              {format(new Date(), 'dd MMM yyyy')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {transactionType === 'expense' 
              ? 'บันทึกรายจ่ายใหม่ของคุณ' 
              : 'บันทึกรายรับใหม่ของคุณ'}
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

                <AmountInput 
                  form={form} 
                  transactionType={transactionType} 
                />

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
                {amountValue && categoryValue && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={cn(
                      "p-3 rounded-md text-sm mb-2",
                      transactionType === 'expense' ? "bg-red-50" : "bg-green-50"
                    )}>
                      <p className="font-medium mb-1">สรุปรายการ:</p>
                      <div className="flex justify-between items-center">
                        <span>{categoryValue}</span>
                        <span className={cn(
                          "font-bold",
                          transactionType === 'expense' ? "text-red-600" : "text-green-600"
                        )}>
                          {transactionType === 'expense' ? '-' : '+'}{formattedAmount || `฿${amountValue}`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <SubmitButton 
                transactionType={transactionType} 
                isSubmitting={isSubmitting} 
              />
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const LoadingCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="w-full max-w-lg mx-auto"
  >
    <Card className="w-full shadow-lg overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100">
      <CardContent className="p-10 flex flex-col items-center justify-center min-h-[350px] space-y-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
          <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground animate-pulse">กำลังโหลด...</p>
      </CardContent>
    </Card>
  </motion.div>
);

const LoginCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="w-full max-w-lg mx-auto"
  >
    <Card className="w-full shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">ยินดีต้อนรับ</h2>
          <p className="text-blue-100 mb-2">เข้าสู่ระบบเพื่อจัดการรายรับรายจ่ายของคุณ</p>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          <div className="bg-white rounded-full p-3 -mt-12 shadow-md mb-4">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          
          <p className="mb-6 text-center">กรุณาเข้าสู่ระบบเพื่อเพิ่มและจัดการรายการของคุณ</p>
          
          <Button 
            onClick={() => signIn('google')} 
            size="lg" 
            className="font-medium w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 border shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
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
          
          <p className="text-xs text-muted-foreground mt-6">
            ระบบนี้ใช้ Google บัญชีของคุณเพื่อการยืนยันตัวตน
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);