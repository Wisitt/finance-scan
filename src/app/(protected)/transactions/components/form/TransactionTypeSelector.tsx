import { cn } from '@/utils/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TransactionType = 'expense' | 'income';

interface TransactionTypeSelectorProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
}

export function TransactionTypeSelector({ 
  value, 
  onChange 
}: TransactionTypeSelectorProps) {
  return (
    <Tabs 
      value={value} 
      onValueChange={(val) => onChange(val as TransactionType)}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 w-full h-12 p-1">
        <TabsTrigger 
          value="expense" 
          className={cn(
            "transition-all duration-300 rounded-md",
            "data-[state=active]:ring-2 data-[state=active]:ring-offset-1",
            value === 'expense' && "data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:ring-red-400"
          )}
        >
          <span className="flex items-center gap-2 font-medium">
            <span className={cn(
              "w-3 h-3 rounded-full transition-colors duration-300",
              value === 'expense' ? "bg-red-500 scale-110" : "bg-gray-300"
            )}></span>
            รายจ่าย
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="income" 
          className={cn(
            "transition-all duration-300 rounded-md",
            "data-[state=active]:ring-2 data-[state=active]:ring-offset-1",
            value === 'income' && "data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:ring-green-400"
          )}
        >
          <span className="flex items-center gap-2 font-medium">
            <span className={cn(
              "w-3 h-3 rounded-full transition-colors duration-300",
              value === 'income' ? "bg-green-500 scale-110" : "bg-gray-300"
            )}></span>
            รายรับ
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}