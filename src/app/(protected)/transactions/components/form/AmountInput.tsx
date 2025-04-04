import { cn } from '@/utils/utils';
import { NumericFormat } from 'react-number-format';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { motion } from 'framer-motion';

interface AmountInputProps {
  form: UseFormReturn<any>;
  transactionType: 'expense' | 'income';
}

export function AmountInput({ form, transactionType }: AmountInputProps) {
  const colorClasses = transactionType === 'expense'
    ? "text-red-500 focus:ring-red-400 hover:border-red-200"
    : "text-green-500 focus:ring-green-400 hover:border-green-200";
    
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
                transactionType === 'expense' ? "text-red-500" : "text-green-500"
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
                    ? 'focus:ring-red-400 hover:border-red-200'
                    : 'focus:ring-green-400 hover:border-green-200'
                )}
                value={field.value ?? ''}
                onValueChange={(values: { floatValue: number | undefined }) => {
                  field.onChange(values.floatValue ?? undefined);
                }}
                onFocus={(e) => e.target.select()}
              />
            </FormControl>
            
            {field.value > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded-full",
                  transactionType === 'expense' ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
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