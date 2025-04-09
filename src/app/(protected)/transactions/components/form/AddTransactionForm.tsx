'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuthUser } from '@/hooks/useAuthUser';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle, Eye, LogIn, ReceiptText, TrendingDown, TrendingUp } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { FormProvider } from 'react-hook-form';
import { AmountInput } from './AmountInput';
import { CategorySelector } from './CategorySelector';

import { DateSelector } from './DateSelector';
import { DescriptionInput } from './DescriptionInput';
import { SubmitButton } from './SubmitButton';
import { TransactionTypeSelector } from './TransactionTypeSelector';
import { useTransactionForm } from './useTransactionForm';

export default function AddTransactionForm() {
  const { isLoading: authLoading, isAuthenticated } = useAuthUser();
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
        "w-full shadow-xl border-t-4 overflow-hidden transition-all duration-300 relative",
        transactionType === 'expense'
          ? "border-t-accent"
          : "border-t-primary"
      )}>
        {/* Scanning line animation */}
        <motion.div
          className="absolute left-0 right-0 h-[1px] pointer-events-none"
          style={{
            backgroundColor: transactionType === 'expense' ? 'var(--accent)' : 'var(--primary)',
            opacity: 0.3
          }}
          animate={{
            top: ["5%", "95%", "5%"],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity
          }}
        />

        <CardHeader className={cn(
          "space-y-1 transition-colors duration-300 pb-4",
          transactionType === 'expense' ? "bg-accent/5" : "bg-primary/5"
        )}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-full relative",
                transactionType === 'expense' ? "bg-accent/10" : "bg-primary/10"
              )}>
                {transactionType === 'expense'
                  ? <TrendingDown className="h-5 w-5 text-accent" />
                  : <TrendingUp className="h-5 w-5 text-primary" />
                }
                {/* Subtle pulse effect */}
                <motion.div
                  className={cn(
                    "absolute inset-0 rounded-full",
                    transactionType === 'expense' ? "border border-accent/20" : "border border-primary/20"
                  )}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [1, 0, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              </div>
              <CardTitle className="text-xl font-bold">
                {transactionType === 'expense' ? 'เพิ่มรายจ่าย' : 'เพิ่มรายรับ'}
              </CardTitle>
            </div>

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className={cn(
                  "font-normal backdrop-blur-sm shadow-sm",
                  transactionType === 'expense' ? "bg-accent/5 border-accent/20" : "bg-primary/5 border-primary/20"
                )}
              >
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

                <div className={cn(
                  "rounded-lg p-4 border relative",
                  transactionType === 'expense' ? "bg-accent/5 border-accent/10" : "bg-primary/5 border-primary/10"
                )}>
                  <AmountInput form={form} transactionType={transactionType} />
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
                      "p-4 rounded-md text-sm border relative",
                      transactionType === 'expense'
                        ? "bg-accent/5 border-accent/20"
                        : "bg-primary/5 border-primary/20"
                    )}>
                      {/* Eye icon with scanning effect */}
                      <div className="absolute top-2 right-2 opacity-10">
                        <div className="relative">
                          <Eye className={cn(
                            "h-6 w-6",
                            transactionType === 'expense' ? "text-accent" : "text-primary"
                          )} />
                          <motion.div
                            className="absolute left-0 right-0 h-[1px]"
                            style={{
                              backgroundColor: transactionType === 'expense' ? 'var(--accent)' : 'var(--primary)'
                            }}
                            animate={{
                              top: ["30%", "70%", "30%"],
                            }}
                            transition={{
                              duration: 2,
                              ease: "easeInOut",
                              repeat: Infinity
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-2">
                        <ReceiptText className={cn(
                          "h-4 w-4",
                          transactionType === 'expense' ? "text-accent" : "text-primary"
                        )} />
                        <p className="font-medium">สรุปรายการ</p>
                      </div>

                      <Separator className={cn(
                        "my-2",
                        transactionType === 'expense' ? "bg-accent/20" : "bg-primary/20"
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
                            transactionType === 'expense' ? "text-accent" : "text-primary"
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
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm bg-primary/10 text-primary border border-primary/20"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>บันทึกรายการสำเร็จ</span>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-primary font-medium ml-2"
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
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-destructive/10 text-destructive rounded-md text-sm border border-destructive/20"
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
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
          ดูประวัติรายการ
        </Button>
        <Separator orientation="vertical" className="mx-2 h-4 self-center" />
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
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
    <Card className="w-full shadow-lg overflow-hidden bg-gradient-to-r from-card to-card/95 border border-primary/20">
      <CardContent className="p-10 flex flex-col items-center justify-center min-h-[350px] space-y-4">
        <div className="relative flex flex-col items-center">
          {/* Eye-themed loader */}
          <motion.div
            className="relative w-16 h-16 mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 rounded-full border-2 border-primary/60"></div>
            <motion.div
              className="absolute inset-4 rounded-full bg-gradient-to-r from-primary/40 to-accent/40"
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Scanning line */}
            <motion.div
              className="absolute left-0 right-0 h-[1px] bg-primary"
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

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
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
    <Card className="w-full shadow-xl overflow-hidden border border-primary/20">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-primary via-primary/80 to-accent/80 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>

          {/* Scanning line animation */}
          <motion.div
            className="absolute left-0 right-0 h-[1px] bg-white/30 pointer-events-none"
            animate={{
              top: ["10%", "90%", "10%"],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity
            }}
          />

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            {/* Eye icon in header */}
            <div className="relative w-16 h-16 mx-auto mb-4">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/60"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 0.9, 0.6]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border border-white/80"
                animate={{
                  scale: [0.8, 1.1, 0.8],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <Eye className="h-8 w-8 absolute top-4 left-4 text-white" />
              <motion.div
                className="absolute left-0 right-0 h-[1px] bg-white/70"
                animate={{
                  top: ["30%", "70%", "30%"],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity
                }}
              />
            </div>

            <h2 className="text-2xl font-bold mb-2">ยินดีต้อนรับ</h2>
            <p className="text-primary-foreground/90 mb-2">เข้าสู่ระบบเพื่อจัดการรายรับรายจ่ายของคุณ</p>
          </motion.div>
        </div>

        <div className="p-8 flex flex-col items-center bg-gradient-to-b from-card to-card/95">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-full p-4 -mt-12 shadow-lg mb-4 border border-primary/20"
          >
            <LogIn className="h-8 w-8 text-primary" />
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
              className="font-medium w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary/90 to-primary hover:brightness-110 text-white shadow-md transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" className="text-white">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#fff"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#fff"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#fff"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#fff"
                />
              </svg>
              เข้าสู่ระบบด้วย Google
            </Button>
          </motion.div>

          <div className="flex items-center gap-2 mt-8">
            <p className="text-xs text-muted-foreground">
              ต้องการความช่วยเหลือ?
            </p>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs flex items-center gap-1 text-primary">
              <span>ติดต่อผู้ดูแลระบบ</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            ระบบนี้ใช้ Google บัญชีของคุณเพื่อการยืนยันตัวตนและปกป้องข้อมูลส่วนบุคคล
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);