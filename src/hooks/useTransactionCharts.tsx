import { useMemo } from 'react';
import { parseISO, format, isWithinInterval, startOfMonth, endOfMonth, subDays, subMonths, addDays } from 'date-fns';
import { Transaction } from '@/types';
import { th } from 'date-fns/locale';

export type TimeRange = '7days' | '30days' | '90days' | 'all' | 'thisMonth' | 'lastMonth';

export function useTransactionCharts(transactions: Transaction[], timeRange: TimeRange) {
  const today = new Date();
  const getTimeRangeDates = () => {
    let startDate: Date;
    let endDate: Date = today;

    switch (timeRange) {
      case '7days':
        startDate = subDays(today, 7);
        break;
      case '30days':
        startDate = subDays(today, 30);
        break;
      case '90days':
        startDate = subDays(today, 90);
        break;
      case 'thisMonth':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      default:
        startDate = new Date(0);
    }

    return { startDate, endDate };
  };

  const filteredTransactions = useMemo(() => {
    if (timeRange === 'all') return transactions;
    const { startDate, endDate } = getTimeRangeDates();
    return transactions.filter(tx => isWithinInterval(parseISO(tx.date), { start: startDate, end: endDate }));
  }, [transactions, timeRange]);

  const { totalIncome, totalExpense, incomesByCategory, expensesByCategory, dailyData } = useMemo(() => {
    const result = {
      totalIncome: 0,
      totalExpense: 0,
      incomesByCategory: {} as Record<string, number>,
      expensesByCategory: {} as Record<string, number>,
      dailyData: {} as Record<string, { income: number; expense: number }>
    };

    let daysToShow = 30;
    if (timeRange === '7days') daysToShow = 7;
    else if (timeRange === '90days') daysToShow = 90;
    else if (timeRange === 'thisMonth') daysToShow = endOfMonth(today).getDate();
    else if (timeRange === 'lastMonth') daysToShow = endOfMonth(subMonths(today, 1)).getDate();

    if (timeRange !== 'all') {
      let startDate: Date;
      if (timeRange === 'thisMonth') startDate = startOfMonth(today);
      else if (timeRange === 'lastMonth') startDate = startOfMonth(subMonths(today, 1));
      else startDate = subDays(today, daysToShow - 1);

      for (let i = 0; i < daysToShow; i++) {
        const date = addDays(startDate, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        result.dailyData[dateStr] = { income: 0, expense: 0 };
      }
    }

    filteredTransactions.forEach(tx => {
      const dateStr = tx.date.split('T')[0];
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        result.totalIncome += amount;
        result.incomesByCategory[tx.category] = (result.incomesByCategory[tx.category] || 0) + amount;
        if (result.dailyData[dateStr]) result.dailyData[dateStr].income += amount;
      } else {
        result.totalExpense += amount;
        result.expensesByCategory[tx.category] = (result.expensesByCategory[tx.category] || 0) + amount;
        if (result.dailyData[dateStr]) result.dailyData[dateStr].expense += amount;
      }
    });

    return result;
  }, [filteredTransactions, timeRange]);

  const savingsRate = useMemo(() => {
    return totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  }, [totalIncome, totalExpense]);

  const sortedExpenseCategories = useMemo(() => {
    return Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [expensesByCategory]);

  const sortedIncomeCategories = useMemo(() => {
    return Object.entries(incomesByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [incomesByCategory]);

  const comparisonData = useMemo(() => {
    const currentMonthStart = startOfMonth(today);
    const currentMonthEnd = endOfMonth(today);
    const lastMonthDate = subMonths(today, 1);
    const lastMonthStart = startOfMonth(lastMonthDate);
    const lastMonthEnd = endOfMonth(lastMonthDate);

    const currentMonthTxs = transactions.filter(tx => {
      const d = parseISO(tx.date);
      return isWithinInterval(d, { start: currentMonthStart, end: currentMonthEnd });
    });

    const lastMonthTxs = transactions.filter(tx => {
      const d = parseISO(tx.date);
      return isWithinInterval(d, { start: lastMonthStart, end: lastMonthEnd });
    });

    const currentIncome = currentMonthTxs.filter(tx => tx.type === 'income').reduce((s, x) => s + x.amount, 0);
    const currentExpense = currentMonthTxs.filter(tx => tx.type === 'expense').reduce((s, x) => s + x.amount, 0);
    const lastIncome = lastMonthTxs.filter(tx => tx.type === 'income').reduce((s, x) => s + x.amount, 0);
    const lastExpense = lastMonthTxs.filter(tx => tx.type === 'expense').reduce((s, x) => s + x.amount, 0);

    const incomeGrowth = lastIncome ? ((currentIncome - lastIncome) / lastIncome) * 100 : 100;
    const expenseGrowth = lastExpense ? ((currentExpense - lastExpense) / lastExpense) * 100 : 100;

    return {
      months: {
        current: format(today, 'MMMM', { locale: th }),
        last: format(lastMonthDate, 'MMMM', { locale: th }),
      },
      data: {
        currentMonthIncome: currentIncome,
        currentMonthExpense: currentExpense,
        lastMonthIncome: lastIncome,
        lastMonthExpense: lastExpense,
        incomeGrowth,
        expenseGrowth,
      },
    };
  }, [transactions]);

  return {
    filteredTransactions,
    totalIncome,
    totalExpense,
    savingsRate,
    incomesByCategory,
    expensesByCategory,
    dailyData,
    sortedExpenseCategories,
    sortedIncomeCategories,
    comparisonData
  };
}
