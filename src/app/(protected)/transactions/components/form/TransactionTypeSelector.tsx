import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

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
      <TabsList className="grid grid-cols-2 w-full h-12 p-1 bg-slate-100">
        <TabsTrigger 
          value="expense" 
          className={cn(
            "transition-all duration-300 rounded-md",
            "data-[state=active]:ring-2 data-[state=active]:ring-offset-1",
            value === 'expense'
              ? "data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:ring-red-400 data-[state=active]:shadow-sm"
              : "hover:bg-slate-200"
          )}
        >
          <motion.span 
            className="flex items-center gap-2 font-medium"
            initial={false}
            animate={{ 
              scale: value === 'expense' ? 1 : 0.95,
              y: value === 'expense' ? 0 : 1
            }}
            transition={{ duration: 0.2 }}
          >
            <ArrowDownCircle 
              className={cn(
                "h-4 w-4 transition-colors",
                value === 'expense' ? "text-red-500" : "text-slate-400"
              )}
            />
            รายจ่าย
          </motion.span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="income" 
          className={cn(
            "transition-all duration-300 rounded-md",
            "data-[state=active]:ring-2 data-[state=active]:ring-offset-1",
            value === 'income' 
              ? "data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:ring-green-400 data-[state=active]:shadow-sm" 
              : "hover:bg-slate-200"
          )}
        >
          <motion.span 
            className="flex items-center gap-2 font-medium"
            initial={false}
            animate={{ 
              scale: value === 'income' ? 1 : 0.95,
              y: value === 'income' ? 0 : 1
            }}
            transition={{ duration: 0.2 }}
          >
            <ArrowUpCircle 
              className={cn(
                "h-4 w-4 transition-colors",
                value === 'income' ? "text-green-500" : "text-slate-400"
              )}
            />
            รายรับ
          </motion.span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}