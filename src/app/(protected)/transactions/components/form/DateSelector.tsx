import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, ScanLine } from 'lucide-react';
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
import { motion } from 'framer-motion';

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
                      ? "focus-visible:ring-primary/50 hover:border-primary/30" 
                      : "focus-visible:ring-accent/50 hover:border-accent/30",
                    field.value && "border-slate-300 font-medium"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {field.value ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "relative",
                          transactionType === 'expense' ? "text-primary" : "text-accent"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        <motion.div 
                          className="absolute -inset-1 rounded-full"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0, 0.2]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                          style={{
                            backgroundColor: transactionType === 'expense' ? 'var(--primary)' : 'var(--accent)',
                            opacity: 0.2
                          }}
                        />
                      </motion.div>
                    ) : (
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    )}
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
              <div className={cn(
                "p-2",
                transactionType === 'expense' ? "bg-primary/5" : "bg-accent/5"
              )}>
                <div className="flex items-center justify-between px-2 py-1 text-xs">
                  <span className="text-muted-foreground">เลือกวันที่</span>
                  <div className="flex items-center gap-1">
                    <ScanLine className={cn(
                      "h-3 w-3",
                      transactionType === 'expense' ? "text-primary" : "text-accent"
                    )} />
                    <span className={transactionType === 'expense' ? "text-primary" : "text-accent"}>
                      Fin$ight
                    </span>
                  </div>
                </div>
              </div>
              <Calendar
                mode="single"
                selected={typeof field.value === 'string' ? parseISO(field.value) : field.value}
                onSelect={field.onChange}
                initialFocus
                disabled={(date) => date > new Date()}
                className={transactionType === 'expense' ? "accent-primary" : "accent-accent"}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}