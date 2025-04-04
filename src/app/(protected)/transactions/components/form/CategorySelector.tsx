import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { Tag, Folder } from 'lucide-react';
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
          <FormLabel className="text-base font-medium">หมวดหมู่</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className={cn(
                "w-full transition-all duration-300 py-3",
                "focus:ring-2 focus:ring-offset-0 shadow-sm",
                transactionType === 'expense' 
                  ? "focus:ring-red-400 hover:border-red-200" 
                  : "focus:ring-green-400 hover:border-green-200",
                field.value && "border-slate-300"
              )}>
                <div className="flex items-center gap-2">
                  {field.value ? (
                    <Tag className={cn(
                      "h-4 w-4",
                      transactionType === 'expense' ? "text-red-500" : "text-green-500"
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
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5" />
                      {category.name}
                    </div>
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