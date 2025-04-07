import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Eye, FileText } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { TransactionFormValues } from './useTransactionForm';

interface DescriptionInputProps {
  form: UseFormReturn<TransactionFormValues>;
  transactionType: 'expense' | 'income';
}

export function DescriptionInput({ form, transactionType }: DescriptionInputProps) {
  const value = form.watch('description');

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
          <div className="relative">
            <FormControl>
              <Textarea
                placeholder="รายละเอียดรายการ"
                className={cn(
                  "resize-none min-h-[38px] sm:min-h-[80px] transition-all duration-300 shadow-sm",
                  "focus:ring-2 focus:ring-offset-0",
                  transactionType === 'expense'
                    ? "focus-visible:ring-primary/50 hover:border-primary/30"
                    : "focus-visible:ring-accent/50 hover:border-accent/30",
                  field.value && "border-slate-300"
                )}
                {...field}
              />
            </FormControl>

            {/* Eye icon appears when there's content */}
            {value && value.length > 10 && (
              <div className="absolute bottom-2 right-2 opacity-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="relative"
                >
                  <Eye className={cn(
                    "h-4 w-4",
                    transactionType === 'expense' ? "text-primary" : "text-accent"
                  )} />
                  <motion.div
                    className="absolute left-0 right-0 h-[1px]"
                    animate={{
                      top: ["30%", "70%", "30%"],
                    }}
                    transition={{
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Infinity
                    }}
                    style={{
                      backgroundColor: transactionType === 'expense' ? 'var(--primary)' : 'var(--accent)'
                    }}
                  />
                </motion.div>
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}