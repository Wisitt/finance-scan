'use client';

import { ReactNode } from 'react';
import { InboxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <InboxIcon className="h-10 w-10 text-muted-foreground" />,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <motion.div 
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-muted/50 p-4 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && action}
    </motion.div>
  );
}