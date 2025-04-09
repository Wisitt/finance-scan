import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Loader2, PlusCircle, ScanLine } from 'lucide-react';

interface SubmitButtonProps {
  transactionType: 'expense' | 'income';
  isSubmitting: boolean;
}

export function SubmitButton({ transactionType, isSubmitting }: SubmitButtonProps) {
  const buttonClasses = transactionType === 'expense'
    ? "bg-gradient-to-r from-accent to-accent/90 hover:brightness-105 shadow-sm hover:shadow-md hover:shadow-accent/10"
    : "bg-gradient-to-r from-primary to-primary/90 hover:brightness-105 shadow-sm hover:shadow-md hover:shadow-primary/10";

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      className="w-full relative overflow-hidden"
    >
      {/* Scanning line animation */}
      {!isSubmitting && (
        <motion.div
          className="absolute left-0 right-0 h-[1px] bg-white/30 pointer-events-none"
          animate={{
            top: ["20%", "80%", "20%"],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity
          }}
        />
      )}

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
            <div className="relative mr-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <motion.div
                className="absolute -inset-1 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                style={{ backgroundColor: 'white', opacity: 0.3 }}
              />
            </div>
            กำลังบันทึก...
          </>
        ) : (
          <>
            {transactionType === 'expense' ? (
              <PlusCircle className="mr-2 h-5 w-5" />
            ) : (
              <ScanLine className="mr-2 h-5 w-5" />
            )}
            {transactionType === 'expense' ? 'บันทึกรายจ่าย' : 'บันทึกรายรับ'}
          </>
        )}
      </Button>
    </motion.div>
  );
}