import { cn } from '@/lib/utils';
import { PlusCircle, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SubmitButtonProps {
  transactionType: 'expense' | 'income';
  isSubmitting: boolean;
}

export function SubmitButton({ transactionType, isSubmitting }: SubmitButtonProps) {
  const buttonClasses = transactionType === 'expense' 
    ? "bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md hover:shadow-red-100" 
    : "bg-green-600 hover:bg-green-700 shadow-sm hover:shadow-md hover:shadow-green-100";
    
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      className="w-full"
    >
      <Button
        type="submit"
        className={cn(
          "w-full transition-all duration-300 text-white font-medium py-6 text-base",
          buttonClasses
        )}
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            กำลังบันทึก...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-5 w-5" />
            {transactionType === 'expense' ? 'บันทึกรายจ่าย' : 'บันทึกรายรับ'}
          </>
        )}
      </Button>
    </motion.div>
  );
}