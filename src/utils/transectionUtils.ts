import { isSameMonth, isSameWeek, isToday, parseISO } from 'date-fns';
import { getGroupTitle } from './dateFormatter';
import { PaginatedTransactionGroups, Transaction, TransactionGroup, TransactionSummary } from '@/types/transaction';

export const filterTransactions = (
  transactions: Transaction[],
  filterType: 'all' | 'income' | 'expense',
  searchTerm: string,
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom',
  categoryFilter: string
): Transaction[] => {
  return transactions.filter(tx => {
    // Type filter
    if (filterType !== 'all' && tx.type !== filterType) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        tx.category.toLowerCase().includes(searchLower) ||
        (tx.description && tx.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Date range filter
    if (dateRange !== 'all') {
      const txDate = parseISO(tx.date);
      const today = new Date();
      
      switch (dateRange) {
        case 'today':
          return isToday(txDate);
        case 'week':
          return isSameWeek(txDate, today);
        case 'month':
          return isSameMonth(txDate, today);
        default:
          return true;
      }
    }
    
    return true;
  });
};

export const sortTransactions = (
  transactions: Transaction[],
  sortOption: 'newest' | 'oldest' | 'highest' | 'lowest'
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    
    switch (sortOption) {
      case 'newest':
        return dateB.getTime() - dateA.getTime();
      case 'oldest':
        return dateA.getTime() - dateB.getTime();
      case 'highest':
        return b.amount - a.amount;
      case 'lowest':
        return a.amount - b.amount;
      default:
        return dateB.getTime() - dateA.getTime();
    }
  });
};

export const paginateTransactions = (
  transactions: Transaction[],
  currentPage: number,
  itemsPerPage: number
): PaginatedTransactionGroups => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const paginatedTransactions = transactions.slice(startIndex, endIndex);
  
  // Group the transactions
  const groups: TransactionGroup[] = [];
  
  paginatedTransactions.forEach(tx => {
    const txDate = parseISO(tx.date);
    const groupTitle = getGroupTitle(txDate);
    
    const existingGroup = groups.find(g => g.title === groupTitle);
    
    if (existingGroup) {
      existingGroup.transactions.push(tx);
    } else {
      groups.push({
        title: groupTitle,
        date: txDate,
        transactions: [tx]
      });
    }
  });
  
  // Sort groups by date (newest first)
  groups.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  return {
    groups,
    totalPages: Math.ceil(transactions.length / itemsPerPage),
    totalItems: transactions.length
  };
};

export const calculateSummary = (transactions: Transaction[]): TransactionSummary => {
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const balance = totalIncome - totalExpense;
  
  return { totalIncome, totalExpense, balance };
};

export const exportTransactionsToCSV = (transactions: Transaction[]): void => {
  if (transactions.length === 0) {
    throw new Error('No data to export');
  }
  
  // Create CSV header row
  const csvHeader = 'วันที่,ประเภท,หมวดหมู่,รายละเอียด,จำนวนเงิน\n';
  
  // Create CSV rows
  const csvRows = transactions.map(t => {
    const date = new Date(t.date).toISOString().split('T')[0];
    const type = t.type === 'income' ? 'รายรับ' : 'รายจ่าย';
    const amount = t.amount.toString();
    
    // Escape fields that might contain commas
    const escapedDescription = `"${t.description?.replace(/"/g, '""') || ''}"`;
    const escapedCategory = `"${t.category.replace(/"/g, '""')}"`;
    
    return `${date},${type},${escapedCategory},${escapedDescription},${amount}`;
  }).join('\n');
  
  // Combine header and rows
  const csvString = csvHeader + csvRows;
  
  // Create blob and download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};