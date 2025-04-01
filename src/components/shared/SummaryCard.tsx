'use client';

import { cn } from '@/utils/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
    <Card className="shadow-md hover:shadow-lg transition-all border border-border/80 overflow-hidden">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1 font-medium">
          <div className={cn('p-1 rounded-full', bgColor)}>
            <Icon className={cn('h-3.5 w-3.5', color)} />
          </div>
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
      <CardContent>
        {(compareText || progressValue !== undefined) && (
          <div className="space-y-2">
            {compareText && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">อัตราออม</span>
                <span className={cn('font-medium', compareColor)}>{compareText}</span>
              </div>
            )}
            {progressValue !== undefined && (
              <Progress value={progressValue} className="h-1.5 bg-muted" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
