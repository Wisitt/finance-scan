'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cva } from 'class-variance-authority';

// Define card variants based on theme
const cardVariants = cva(
  "overflow-hidden border-none h-full shadow-lg hover:shadow-2xl transition-all duration-300 group",
  {
    variants: {
      theme: {
        dark: "bg-[#1A1A1A] text-white",
        light: "bg-white text-[#333333] border border-gray-100",
      },
    },
    defaultVariants: {
      theme: "dark",
    },
  }
);

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  index 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  index: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <Card className={cardVariants({ theme: isDark ? "dark" : "light" })}>
        <CardContent className="p-8 relative h-full">
          {/* Gradient Hover Layer */}
          <div
            className={`
              absolute inset-0 bg-gradient-to-br opacity-0 
              group-hover:opacity-100 transition-opacity duration-500 -z-10
              ${isDark 
                ? 'from-primary-800/10 to-primary-600/20' 
                : 'from-primary-100 to-primary-200'}
            `}
          ></div>

          <div className="mb-6 relative">
            {/* Icon Wrapper */}
            <div
              className={`
                w-16 h-16 rounded-2xl flex items-center justify-center 
                transform group-hover:scale-110 transition-transform duration-300
                ${isDark ? 'bg-primary-800/20' : 'bg-primary-100'}
              `}
            >
              <div className="text-primary">{icon}</div>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-3">{title}</h3>

          <p className={`mb-6 ${isDark ? 'text-[#BBBBBB]' : 'text-gray-600'}`}>
            {description}
          </p>

          <Button
            variant="ghost"
            className="mt-auto w-fit transition-colors text-sm text-primary"
          >
            <span>เรียนรู้เพิ่มเติม</span>
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}