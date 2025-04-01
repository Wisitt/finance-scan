'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransactionListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <Separator />
        <CardContent className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}