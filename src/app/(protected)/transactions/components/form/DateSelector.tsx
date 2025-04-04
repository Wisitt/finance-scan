import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { TransactionFormValues } from './useTransactionForm';

interface DateSelectorProps {
  form: UseFormReturn<TransactionFormValues>;
  transactionType: 'expense' | 'income';
}

export function DateSelector({ form, transactionType }: DateSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col w-full">
          <FormLabel className="text-base font-medium">วันที่</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal transition-all duration-300 py-3 h-auto shadow-sm",
                    "focus:ring-2 focus:ring-offset-0",
                    transactionType === 'expense' 
                      ? "focus-visible:ring-red-400 hover:border-red-200" 
                      : "focus-visible:ring-green-400 hover:border-green-200",
                    field.value && "border-slate-300 font-medium"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon 
                      className={cn(
                        "h-4 w-4",
                        field.value 
                          ? transactionType === 'expense' ? "text-red-500" : "text-green-500"
                          : "text-muted-foreground"
                      )} 
                    />
                    {field.value ? (
                      format(
                        typeof field.value === 'string' 
                          ? parseISO(field.value) 
                          : field.value, 
                        "d MMMM yyyy"
                      )
                    ) : (
                      <span>เลือกวันที่</span>
                    )}
                  </div>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 sm:w-[300px]" align="start">
              <Calendar
                mode="single"
                selected={typeof field.value === 'string' ? parseISO(field.value) : field.value}
                onSelect={field.onChange}
                initialFocus
                disabled={(date) => date > new Date()}
                className={transactionType === 'expense' ? "accent-red-600" : "accent-green-600"}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}