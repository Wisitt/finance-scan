import { cn } from '@/utils/utils';
import { format } from 'date-fns';
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

interface DateSelectorProps {
  form: UseFormReturn<any>;
  transactionType: 'expense' | 'income';
}

export default function DateSelector({ form, transactionType }: DateSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col w-full">
          <FormLabel className="text-base">วันที่</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal transition-all duration-300 py-3 h-auto",
                    transactionType === 'expense' 
                      ? "focus-visible:ring-red-400 hover:border-red-200" 
                      : "focus-visible:ring-green-400 hover:border-green-200"
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
            <PopoverContent className="w-auto p-0 sm:w-[300px]" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                initialFocus
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}