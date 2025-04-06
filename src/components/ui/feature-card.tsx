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
      className="group relative overflow-hidden rounded-2xl border border-border p-6 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
      
      <div className="relative w-14 h-14 rounded-full mb-4 bg-primary/10 flex items-center justify-center">
        <motion.div
          className="text-primary"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: index * 0.3
          }}
        >
          {icon}
        </motion.div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}