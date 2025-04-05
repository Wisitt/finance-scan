import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { FileText } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { TransactionFormValues } from './useTransactionForm';

interface DescriptionInputProps {
  form: UseFormReturn<TransactionFormValues>;
  transactionType: 'expense' | 'income';
}

export function DescriptionInput({ form, transactionType }: DescriptionInputProps) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-base font-medium flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 opacity-70" />
            รายละเอียด <span className="text-xs text-muted-foreground">(ไม่บังคับ)</span>
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="รายละเอียดรายการ"
              className={cn(
                "resize-none min-h-[38px] sm:min-h-[80px] transition-all duration-300 shadow-sm",
                "focus:ring-2 focus:ring-offset-0",
                transactionType === 'expense' 
                  ? "focus-visible:ring-red-400 hover:border-red-200" 
                  : "focus-visible:ring-green-400 hover:border-green-200",
                field.value && "border-slate-300"
              )}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}