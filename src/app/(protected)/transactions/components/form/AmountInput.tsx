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

interface AmountInputProps {
  form: UseFormReturn<any>;
  transactionType: 'expense' | 'income';
}

export function AmountInput({ form, transactionType }: AmountInputProps) {
  return (
    <FormField
      control={form.control}
      name="amount"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-base">จำนวนเงิน</FormLabel>
          <div className="relative">
            <span className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium transition-colors duration-300",
              transactionType === 'expense' ? "text-red-500" : "text-green-500"
            )}>
              ฿
            </span>
            <FormControl>
              <NumericFormat
                thousandSeparator
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                allowLeadingZeros={false}
                placeholder="0.00"
                className={cn(
                  'pl-8 pr-3 py-3 text-lg font-medium w-full rounded-md border',
                  'focus:outline-none focus:ring-2 transition-all duration-300',
                  transactionType === 'expense'
                    ? 'focus:ring-red-400 hover:border-red-200'
                    : 'focus:ring-green-400 hover:border-green-200'
                )}
                value={field.value ?? ''}
                onValueChange={(values: { floatValue: number | undefined }) => {
                  field.onChange(values.floatValue ?? undefined);
                }}
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}