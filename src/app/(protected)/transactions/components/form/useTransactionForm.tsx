import { useAuthUser } from '@/hooks/useAuthUser';
import { useCategoryStore } from '@/store/categoryStore';
import { useTransactionStore } from '@/store/transactionStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const transactionSchema = z.object({
  amount: z.number().positive('จำนวนต้องมากกว่า 0'),
  category: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  description: z.string().optional(),
  date: z.date({
    required_error: "กรุณาระบุวันที่",
  }),
});
export type TransactionFormValues = z.infer<typeof transactionSchema>;

const defaultValues: Partial<TransactionFormValues> = {
  amount: undefined,
  category: '',
  date: new Date(),
  description: '',
};

export function useTransactionForm() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuthUser();
  const { addTransaction } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formattedAmount, setFormattedAmount] = useState('');
  const [formState, setFormState] = useState({
    isSuccess: false,
    error: null
  });

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {}
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  const handleTransactionTypeChange = (value: 'expense' | 'income') => {
    setTransactionType(value);
    form.setValue('category', '');
  };

  const handleAmountChange = (value: number | undefined) => {
    form.setValue('amount', value = 0);
    if (value) {
      setFormattedAmount(new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2
      }).format(value));
    } else {
      setFormattedAmount('');
    }
  };

  // This function is what your component expects
  const handleSubmit = async (data: TransactionFormValues) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('กรุณาเลือกผู้ใช้ก่อนเพิ่มรายการ');
      return;
    }

    setIsSubmitting(true);
    setFormState({ isSuccess: false, error: null });

    try {
      const newTransaction = {
        user_id: user.id,
        amount: data.amount,
        category: data.category,
        description: data.description || '',
        date: new Date(data.date).toISOString(),
        type: transactionType,
      };

      await addTransaction(newTransaction);
      toast.success(`บันทึก${transactionType === 'expense' ? 'รายจ่าย' : 'รายรับ'}: ฿${data.amount.toFixed(2)} (${data.category}) สำเร็จ`);

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

  // Also include onSubmit for consistency with your previous implementation
  const onSubmit = form.handleSubmit(handleSubmit);
  const resetForm = () => {
    form.reset(defaultValues);
    setFormState({ isSuccess: false, error: null });
  };
  return {
    form,
    onSubmit,
    transactionType,
    setTransactionType,
    isSubmitting,
    formattedAmount,
    handleAmountChange,
    filteredCategories,
    authLoading,
    isAuthenticated,
    user,
    handleTransactionTypeChange,
    handleSubmit,
    formState,
    resetForm
  };
}