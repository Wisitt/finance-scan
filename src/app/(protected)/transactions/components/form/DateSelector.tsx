'use client';

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
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

          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              className={cn(
                "pl-10",
                transactionType === 'expense'
                  ? "border-accent/20 focus-visible:ring-accent/20"
                  : "border-primary/20 focus-visible:ring-primary/20"
              )}
              {...field}
              value={field.value ?
                new Date(field.value).toISOString().split('T')[0] : ''
              }
              onChange={(e) => {
                field.onChange(e.target.value ? new Date(e.target.value) : null);
              }}
            />
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}