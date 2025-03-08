'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useTransactionStore } from '@/store/transactionStore';
import { Transaction } from '@/types';

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { signIn } from 'next-auth/react';
import { useAuthUser } from '@/hook/useAuthUser';

// Schema for form validation
const transactionSchema = z.object({
  amount: z.number().positive('จำนวนต้องมากกว่า 0'),
  category: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  description: z.string().optional(),
  date: z.date({
    required_error: "กรุณาระบุวันที่",
  }),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

// Custom number formatter for currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export default function AddTransactionForm() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuthUser();
  const { categories, addTransaction } = useTransactionStore();
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formattedAmount, setFormattedAmount] = useState('');

  // Initialize form with react-hook-form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: undefined,
      category: '',
      description: '',
      date: new Date(),
    },
  });
  
  // Filter categories based on transaction type
  const filteredCategories = categories.filter(cat => cat.type === transactionType);
  
  // Handle amount input changes with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || value === '.') {
      form.resetField('amount');
      setFormattedAmount('');
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        form.setValue('amount', numValue);
        setFormattedAmount(formatCurrency(numValue));
      } else {
        form.resetField('amount');
        setFormattedAmount('');
      }
    }
  };
  

  // Update formatted amount when form value changes
  useEffect(() => {
    const amount = form.getValues('amount');
    if (amount) {
      setFormattedAmount(formatCurrency(amount));
    }
  }, [form]);

  // Handle form submission
  const onSubmit = async (data: TransactionFormValues) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('กรุณาเลือกผู้ใช้ก่อนเพิ่มรายการ');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newTransaction: Omit<Transaction, 'id'> = {
        user_id: user.id,
        amount: data.amount,
        category: data.category,  
        description: data.description || '',
        date: format(data.date, 'yyyy-MM-dd'),
        type: transactionType,
        created_at: ''
      };
      
      await addTransaction(newTransaction);
      toast.success(`เพิ่มรายการ${transactionType === 'expense' ? 'รายจ่าย' : 'รายรับ'}สำเร็จแล้ว`);

      // Reset form
      form.reset({
        amount: undefined,
        category: '',
        description: '',
        date: new Date(),
      });
      setFormattedAmount('');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('ไม่สามารถเพิ่มรายการได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (authLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
        </CardContent>
      </Card>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Card className="w-full shadow-lg">
        <CardContent className="p-6 text-center">
          <p className="mb-4">กรุณาเข้าสู่ระบบเพื่อเพิ่มรายการ</p>
          <Button onClick={() => signIn('google')}>
            เข้าสู่ระบบด้วย Google
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="w-full shadow-lg border-t-4 border-t-primary">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-2xl font-bold">เพิ่มรายการ</CardTitle>
          <Badge variant="outline" className="font-normal">
            {format(new Date(), 'dd MMM yyyy')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          เพิ่มรายการรายรับหรือรายจ่ายใหม่ของคุณ
        </p>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Transaction Type Tabs */}
              <Tabs 
                value={transactionType} 
                onValueChange={(value) => setTransactionType(value as 'expense' | 'income')}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger 
                    value="expense" 
                    className={cn(
                      "transition-all duration-200",
                      transactionType === 'expense' && "data-[state=active]:bg-red-50 data-[state=active]:text-red-600"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn(
                        "w-3 h-3 rounded-full",
                        transactionType === 'expense' ? "bg-red-500" : "bg-gray-300"
                      )}></span>
                      รายจ่าย
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="income" 
                    className={cn(
                      "transition-all duration-200",
                      transactionType === 'income' && "data-[state=active]:bg-green-50 data-[state=active]:text-green-600"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn(
                        "w-3 h-3 rounded-full",
                        transactionType === 'income' ? "bg-green-500" : "bg-gray-300"
                      )}></span>
                      รายรับ
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Amount Field */}
              <FormField
                control={form.control}
                name="amount"
                render={({  }) => (
                  <FormItem>
                    <FormLabel>จำนวนเงิน</FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ฿
                      </span>
                      <FormControl>
                        <Input
                          placeholder="0.00"
                          className={cn(
                            "pl-8 text-lg font-medium",
                            transactionType === 'expense' 
                              ? "focus-visible:ring-red-500" 
                              : "focus-visible:ring-green-500"
                          )}
                          onChange={handleAmountChange}
                          value={formattedAmount}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมวดหมู่</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={cn(
                          "w-full",
                          transactionType === 'expense' 
                            ? "focus-visible:ring-red-500" 
                            : "focus-visible:ring-green-500"
                        )}>
                          <SelectValue placeholder="เลือกหมวดหมู่" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.length ? (
                          filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.name} className="cursor-pointer">
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            ไม่พบหมวดหมู่
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Selection */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันที่</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              transactionType === 'expense' 
                                ? "focus-visible:ring-red-500" 
                                : "focus-visible:ring-green-500"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "d MMMM yyyy")
                            ) : (
                              <span>เลือกวันที่</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รายละเอียด (ไม่บังคับ)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="รายละเอียดรายการ"
                        className={cn(
                          "resize-none min-h-[80px]",
                          transactionType === 'expense' 
                            ? "focus-visible:ring-red-500" 
                            : "focus-visible:ring-green-500"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="transition-all duration-200 ease-in-out">
              <Button
                type="submit"
                className={cn(
                  "w-full",
                  transactionType === 'expense' 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-green-600 hover:bg-green-700"
                )}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {transactionType === 'expense' ? 'บันทึกรายจ่าย' : 'บันทึกรายรับ'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}