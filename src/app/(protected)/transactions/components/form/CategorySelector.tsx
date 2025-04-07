import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Eye, Folder, Tag } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { TransactionFormValues } from './useTransactionForm';

interface CategorySelectorProps {
  form: UseFormReturn<TransactionFormValues>;
  categories: { id: string; name: string; type: string; }[];
  transactionType: 'expense' | 'income';
}

export function CategorySelector({
  form,
  categories,
  transactionType
}: CategorySelectorProps) {
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-base font-medium">หมวดหมู่</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className={cn(
                "w-full transition-all duration-300 py-3",
                "focus:ring-2 focus:ring-offset-0 shadow-sm",
                transactionType === 'expense'
                  ? "focus:ring-primary/50 hover:border-primary/30"
                  : "focus:ring-accent/50 hover:border-accent/30",
                field.value && "border-slate-300"
              )}>
                <div className="flex items-center gap-2">
                  {field.value ? (
                    <Tag className={cn(
                      "h-4 w-4",
                      transactionType === 'expense' ? "text-primary" : "text-accent"
                    )} />
                  ) : (
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  )}
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </div>
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[280px]">
              {categories.length ? (
                categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.name}
                    className="cursor-pointer"
                  >
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Tag className={cn(
                        "h-3.5 w-3.5",
                        transactionType === 'expense' ? "text-primary" : "text-accent"
                      )} />
                      {category.name}
                    </motion.div>
                  </SelectItem>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <Eye className={cn(
                    "h-5 w-5 opacity-50",
                    transactionType === 'expense' ? "text-primary" : "text-accent"
                  )} />
                  ไม่พบหมวดหมู่
                </div>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}