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
      <TabsList className="grid grid-cols-2 w-full h-12 p-1 bg-muted/50 relative">
        {/* Animated highlight for active tab */}
        <motion.div 
          className="absolute inset-1 bg-white rounded-md shadow-sm z-0"
          layoutId="active-tab"
          transition={{ type: "spring", duration: 0.5 }}
          style={{ 
            width: "calc(50% - 4px)",
            left: value === 'expense' ? '2px' : 'calc(50% + 2px)'
          }}
        />
        
        <TabsTrigger 
          value="expense" 
          className={cn(
            "transition-all duration-300 rounded-md z-10 relative overflow-hidden",
            value === 'expense' ? "text-primary" : "hover:bg-muted/80"
          )}
        >
          <motion.div 
            className="flex items-center gap-2 font-medium"
            initial={false}
            animate={{ 
              scale: value === 'expense' ? 1 : 0.95
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <ArrowDownCircle 
                className={cn(
                  "h-4 w-4 transition-colors",
                  value === 'expense' ? "text-primary" : "text-muted-foreground"
                )}
              />
              
              {/* Scanning line animation for active state */}
              {value === 'expense' && (
                <motion.div 
                  className="absolute left-0 right-0 h-[1px] bg-primary" 
                  animate={{ 
                    top: ["30%", "70%", "30%"],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    ease: "easeInOut", 
                    repeat: Infinity 
                  }}
                />
              )}
            </div>
            รายจ่าย
          </motion.div>
        </TabsTrigger>
        
        <TabsTrigger 
          value="income" 
          className={cn(
            "transition-all duration-300 rounded-md z-10 relative overflow-hidden",
            value === 'income' ? "text-accent" : "hover:bg-muted/80"
          )}
        >
          <motion.div 
            className="flex items-center gap-2 font-medium"
            initial={false}
            animate={{ 
              scale: value === 'income' ? 1 : 0.95
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <ArrowUpCircle 
                className={cn(
                  "h-4 w-4 transition-colors",
                  value === 'income' ? "text-accent" : "text-muted-foreground"
                )}
              />
              
              {/* Scanning line animation for active state */}
              {value === 'income' && (
                <motion.div 
                  className="absolute left-0 right-0 h-[1px] bg-accent" 
                  animate={{ 
                    top: ["30%", "70%", "30%"],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    ease: "easeInOut", 
                    repeat: Infinity 
                  }}
                />
              )}
            </div>
            รายรับ
          </motion.div>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}