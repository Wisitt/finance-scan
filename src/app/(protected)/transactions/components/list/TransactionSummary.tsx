import { cn } from '@/utils/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpCircle, Wallet, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

type SummaryProps = {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
};

export default function TransactionSummary({ summary }: SummaryProps) {
  const summaryCards = [
    {
      title: 'รายรับทั้งหมด',
      value: summary.totalIncome,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: Wallet,
    },
    {
      title: 'รายจ่ายทั้งหมด',
      value: summary.totalExpense,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: CreditCard,
    },
    {
      title: 'ยอดคงเหลือ',
      value: summary.balance,
      color: summary.balance >= 0 ? 'text-primary' : 'text-red-600',
      bgColor: summary.balance >= 0 ? 'bg-primary/10' : 'bg-red-100',
      icon: ArrowUpCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {summaryCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="bg-muted/20 h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className={cn('text-2xl font-bold', card.color)}>
                    {formatCurrency(card.value)}
                  </p>
                </div>
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    card.bgColor
                  )}
                >
                  <card.icon
                    className={cn('h-5 w-5', card.color)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}