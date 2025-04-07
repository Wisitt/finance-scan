import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { TransactionFormValues } from './useTransactionForm';

interface AmountInputProps {
  form: UseFormReturn<TransactionFormValues>;
  transactionType: 'expense' | 'income';
}

export function AmountInput({ form, transactionType }: AmountInputProps) {
  return (
    <FormField
      control={form.control}
      name="amount"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-base font-medium">จำนวนเงิน</FormLabel>
          <div className="relative">
            <motion.span
              animate={{
                scale: field.value ? [1, 1.2, 1] : 1,
                x: field.value ? [0, -2, 0] : 0
              }}
              transition={{ duration: 0.3 }}
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium transition-colors duration-300",
                transactionType === 'expense' ? "text-primary" : "text-accent"
              )}
            >
              ฿
            </motion.span>
            <FormControl>
              <NumericFormat
                thousandSeparator
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                allowLeadingZeros={false}
                placeholder="0.00"
                className={cn(
                  'pl-8 pr-3 py-3 text-lg font-medium w-full rounded-md border shadow-sm',
                  'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-300',
                  field.value && 'font-bold',
                  transactionType === 'expense'
                    ? 'focus:ring-primary/50 hover:border-primary/30'
                    : 'focus:ring-accent/50 hover:border-accent/30'
                )}
                value={field.value ?? ''}
                onValueChange={(values: { floatValue: number | undefined }) => {
                  field.onChange(values.floatValue ?? undefined);
                }}
                onFocus={(e) => e.target.select()}
              />
            </FormControl>

            {/* Eye-shaped scanning animation for high-value amounts */}
            {field.value && field.value > 1000 && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                <div className="relative h-5 w-5">
                  <Eye className={transactionType === 'expense' ? "text-primary" : "text-accent"} />
                  <motion.div
                    className="absolute left-0 right-0 h-[1px]"
                    style={{
                      backgroundColor: transactionType === 'expense' ? 'var(--primary)' : 'var(--accent)'
                    }}
                    animate={{
                      top: ["30%", "70%", "30%"],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity
                    }}
                  />
                </div>
              </div>
            )}

            {field.value > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded-full",
                  transactionType === 'expense' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                )}
              >
                {transactionType === 'expense' ? 'รายจ่าย' : 'รายรับ'}
              </motion.div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}