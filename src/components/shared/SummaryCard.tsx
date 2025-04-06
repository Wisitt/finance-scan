'use client';

import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

type SummaryCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  loading?: boolean;
  compareText?: string;
  compareColor?: string;
  progressValue?: number;
};

export function SummaryCard({
  title,
  value,
  icon: Icon,
  color = 'text-primary',
  bgColor = 'bg-primary/10',
  loading = false,
  compareText,
  compareColor = 'text-muted-foreground',
  progressValue,
}: SummaryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative"
    >
      <Card className="shadow-md hover:shadow-lg transition-all border border-border/80 overflow-hidden bg-gradient-to-br from-card to-card/95">
        {/* Eye-like scanning line animation */}
        <motion.div 
          className={cn("absolute left-0 right-0 h-[1px]", color.replace('text-', 'bg-'))}
          style={{ opacity: 0.3 }}
          animate={{ 
            top: ["20%", "80%", "20%"],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ 
            duration: 3.5, 
            ease: "easeInOut", 
            repeat: Infinity 
          }}
        />

        <CardHeader className="pb-2 relative z-10">
          <CardDescription className="flex items-center gap-1 font-medium">
            <motion.div 
              className={cn('p-1.5 rounded-full flex items-center justify-center', bgColor)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Icon with subtle pulsing animation */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.9, 1, 0.9]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Icon className={cn('h-3.5 w-3.5', color)} />
              </motion.div>
            </motion.div>
            <span>{title}</span>
          </CardDescription>
          
          {loading ? (
            <Skeleton className="h-8 w-32 mt-1" />
          ) : (
            <CardTitle className={cn('text-2xl font-bold', color)}>
              {formatCurrency(value)}
            </CardTitle>
          )}
        </CardHeader>
        
        <CardContent className="relative z-10">
          {(compareText || progressValue !== undefined) && (
            <div className="space-y-2">
              {compareText && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">อัตราออม</span>
                  <span className={cn('font-medium', compareColor)}>{compareText}</span>
                </div>
              )}
              {progressValue !== undefined && (
                <div className="relative">
                  {/* Custom progress bar with eye-theme gradient */}
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", 
                        color === 'text-primary' ? 'bg-gradient-to-r from-primary/80 to-primary' : 
                        color === 'text-destructive' ? 'bg-gradient-to-r from-destructive/80 to-destructive' :
                        'bg-gradient-to-r from-accent/80 to-accent'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressValue}%` }}
                      transition={{ 
                        duration: 0.8, 
                        ease: "easeOut"
                      }}
                    />
                  </div>
                  
                  {/* Scanning line on progress bar */}
                  {progressValue > 15 && (
                    <motion.div 
                      className="absolute top-0 bottom-0 w-[2px] bg-background/60 rounded-full"
                      animate={{ 
                        left: ["0%", `${Math.min(progressValue, 95)}%`, "0%"],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        ease: "easeInOut", 
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>

        {/* Background decorative element */}
        <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-5">
          <motion.div 
            className={cn("w-full h-full rounded-full", color.replace('text-', 'bg-'))}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </Card>
    </motion.div>
  );
}