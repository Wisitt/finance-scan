'use client';

import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, BellRing, ChevronDown, ChevronRight, ChevronUp, CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { Card } from './card';
import { motion } from 'framer-motion';

export function DashboardCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <Card className="overflow-hidden border border-border w-full max-w-md mx-auto shadow-xl">
      <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-foreground/90">เงินคงเหลือ</h3>
            <div className="flex items-center">
              <span className="text-3xl font-bold">฿28,456.20</span>
              <div className="ml-3 flex items-center text-sm text-accent">
                <ChevronUp className="h-4 w-4 mr-1" />
                <span>+12.5%</span>
              </div>
            </div>
          </div>
          
          {/* Eye-themed logo in card */}
          <motion.div
            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0],
            }}
            transition={{ 
              duration: 8, 
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <div className="absolute inset-2 rounded-full bg-card/80 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </motion.div>
        </div>
        
        {/* Chart visualization */}
        <div className="mb-6 h-36 relative">
          <div className="absolute inset-0 flex items-end justify-between px-2">
            {[35, 55, 40, 60, 45, 70, 50, 75, 65, 80, 60, 85].map((height, index) => (
              <motion.div
                key={index}
                className="w-1/12 bg-gradient-to-t from-primary/80 to-accent/80 rounded-t"
                initial={{ height: '0%' }}
                animate={{ height: `${height}%` }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.05,
                  repeat: 1,
                  repeatDelay: 30
                }}
              />
            ))}
          </div>
          
          {/* Scanning line effect */}
          <motion.div 
            className="absolute left-0 right-0 h-[1px] bg-primary/40"
            initial={{ top: '0%' }}
            animate={{ 
              top: ['10%', '90%', '10%'],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 5, 
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-card/80 p-3 border border-border/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">รายรับ</span>
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-accent" />
              </div>
            </div>
            <div className="font-medium">฿32,450</div>
            <div className="text-xs text-accent flex items-center mt-1">
              <ChevronUp className="h-3 w-3 mr-1" />
              <span>+8.2%</span>
            </div>
          </div>
          
          <div className="rounded-xl bg-card/80 p-3 border border-border/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">รายจ่าย</span>
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-3 w-3 text-primary" />
              </div>
            </div>
            <div className="font-medium">฿12,250</div>
            <div className="text-xs text-primary flex items-center mt-1">
              <ChevronDown className="h-3 w-3 mr-1" />
              <span>-4.3%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}