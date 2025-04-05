'use client';

import { useState, useMemo } from 'react';
import { parseISO, isToday, isSameWeek, isSameMonth } from 'date-fns';
import { Transaction } from '@/types';

export type FilterOptions = {
  type: 'all' | 'income' | 'expense';
  category: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortOption: 'newest' | 'oldest' | 'highest' | 'lowest';
  searchTerm: string;
};

export const DEFAULT_FILTERS: FilterOptions = {
  type: 'all',
  category: 'all',
  dateRange: 'all',
  sortOption: 'newest',
  searchTerm: '',
};

export function useTransactionFilters(transactions: Transaction[]) {
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  const uniqueCategories = useMemo(() => {
    if (!transactions.length) return ['all'];
    
    const categories = Array.from(new Set(
      transactions
        .map(tx => tx.category)
        .filter(category => category && category.trim() !== '')
    ));
    
    return ['all', ...categories];
  }, [transactions]);

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    if (filters.type !== DEFAULT_FILTERS.type) count++;
    if (filters.category !== DEFAULT_FILTERS.category) count++;
    if (filters.dateRange !== DEFAULT_FILTERS.dateRange) count++;
    if (filters.searchTerm !== DEFAULT_FILTERS.searchTerm && filters.searchTerm.trim() !== '') count++;
    
    return count;
  }, [filters]);

  const processedTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    const { type, category, dateRange, sortOption, searchTerm } = filters;
    
    let filtered = transactions.filter(tx => {
      if (type !== 'all' && tx.type !== type) return false;
      
      if (category !== 'all' && tx.category !== category) return false;
      
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const inCategory = tx.category?.toLowerCase().includes(lowerSearch) || false;
        const inDescription = tx.description?.toLowerCase().includes(lowerSearch) || false;
        if (!inCategory && !inDescription) return false;
      }
      
      // Filter by date range
      if (dateRange !== 'all') {
        const txDate = parseISO(tx.date);
        const today = new Date();
        if (dateRange === 'today' && !isToday(txDate)) return false;
        if (dateRange === 'week' && !isSameWeek(txDate, today)) return false;
        if (dateRange === 'month' && !isSameMonth(txDate, today)) return false;
      }
      
      return true;
    });
    
    // Then sort the filtered results
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.amount - a.amount;
        case 'lowest':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });
  }, [transactions, filters]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    
    processedTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += Number(tx.amount);
      } else {
        totalExpense += Number(tx.amount);
      }
    });
    
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: processedTransactions.length
    };
  }, [processedTransactions]);

  return {
    filters,
    updateFilter,
    resetFilters,
    uniqueCategories,
    processedTransactions,
    summary,
    activeFilterCount
  };
}