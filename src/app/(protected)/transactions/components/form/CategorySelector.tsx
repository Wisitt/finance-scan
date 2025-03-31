import { cn } from '@/utils/utils';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategorySelectorProps {
  form: UseFormReturn<any>;
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
          <FormLabel className="text-base">หมวดหมู่</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className={cn(
                "w-full transition-all duration-300 py-3",
                transactionType === 'expense' 
                  ? "focus-visible:ring-red-400 hover:border-red-200" 
                  : "focus-visible:ring-green-400 hover:border-green-200"
              )}>
                <SelectValue placeholder="เลือกหมวดหมู่" />
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
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-muted-foreground">
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