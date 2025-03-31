import { cn } from '@/utils/utils';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface DescriptionInputProps {
  form: UseFormReturn<any>;
  transactionType: 'expense' | 'income';
}

export default function DescriptionInput({ form, transactionType }: DescriptionInputProps) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-base">รายละเอียด (ไม่บังคับ)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="รายละเอียดรายการ"
              className={cn(
                "resize-none min-h-[38px] sm:min-h-[80px] transition-all duration-300",
                transactionType === 'expense' 
                  ? "focus-visible:ring-red-400 hover:border-red-200" 
                  : "focus-visible:ring-green-400 hover:border-green-200"
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