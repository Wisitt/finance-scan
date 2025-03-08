export type TransactionType = 'income' | 'expense';
export type FilterType = 'all' | 'income' | 'expense';
export type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
export type DateRangeOption = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description?: string;
  receipt_images?: string[];
  created_by?: string;
}
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}
export interface TransactionGroup {
  title: string;
  date: Date;
  transactions: Transaction[];
}

export interface PaginatedTransactionGroups {
  groups: TransactionGroup[];
  totalPages: number;
  totalItems: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}