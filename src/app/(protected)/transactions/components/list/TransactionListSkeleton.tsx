'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export function TransactionListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-muted/10 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-32" />
                </div>
                <div className="relative">
                  {/* Eye-themed skeleton loader */}
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/10"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {/* Scanning line effect */}
                  <motion.div
                    className="absolute left-0 right-0 h-[1px] bg-primary/30"
                    animate={{
                      top: ["30%", "70%", "30%"],
                      opacity: [0.2, 0.6, 0.2]
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Skeleton */}
      <Card className="border-border/50">
        <CardHeader className="pb-0">
          <Skeleton className="h-7 w-40 mb-1" />
          <Skeleton className="h-4 w-60" />
          <div className="flex flex-wrap gap-2 mt-4 relative">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px]" />

            {/* Global scanning animation */}
            <motion.div
              className="absolute left-0 right-0 h-[1px] bg-primary/30 pointer-events-none"
              animate={{
                top: ["0%", "100%", "0%"],
                opacity: [0.1, 0.4, 0.1]
              }}
              transition={{
                duration: 3,
                ease: "linear",
                repeat: Infinity
              }}
            />
          </div>
        </CardHeader>

        <Separator className="my-4 bg-border/50" />

        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center justify-between p-4 border rounded-lg border-border/50"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-24" />
            </motion.div>
          ))}

          {/* Pagination skeleton */}
          <div className="flex justify-between items-center pt-4">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}