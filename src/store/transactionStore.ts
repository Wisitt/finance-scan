// transactionStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  created_at: string;
  receipt_images?: string[];
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'user_id'>>) => Promise<Transaction>;
}

// Helper to save transactions to localStorage
const saveTransactionsToLocalStorage = (transactions: Transaction[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }
};

// Helper to get current user ID from localStorage
const getCurrentUserId = (): string => {
  if (typeof window !== 'undefined') {
    const userStore = localStorage.getItem('user-store');
    if (userStore) {
      try {
        const parsed = JSON.parse(userStore);
        return parsed.state?.currentUser?.id || 'default-user-id';
      } catch (e) {
        console.error('Error parsing user store:', e);
      }
    }
  }
  return 'default-user-id';
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  
  // Fetch transactions from localStorage
  fetchTransactions: async () => {
    try {
      set({ loading: true, error: null });
      
      // Get transactions from localStorage
      if (typeof window !== 'undefined') {
        const savedTransactions = localStorage.getItem('transactions');
        const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        
        // Sort by date desc
        const sortedTransactions = [...transactions].sort(
          (a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        set({ transactions: sortedTransactions, loading: false });
      } else {
        set({ transactions: [], loading: false });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch transactions'),
        loading: false 
      });
    }
  },
  
  // Add new transaction
  addTransaction: async (transactionData) => {
    try {
      const userId = getCurrentUserId();
      
      // สร้าง transaction ใหม่ด้วยค่าที่ระบุและค่าที่สร้างอัตโนมัติ
      const newTransaction: Transaction = {
        id: uuidv4(),
        user_id: userId,
        amount: transactionData.amount,
        type: transactionData.type,
        category: transactionData.category,
        description: transactionData.description,
        date: transactionData.date,
        receipt_images: transactionData.receipt_images,
        created_at: new Date().toISOString(),
      };
      
      const updatedTransactions = [...get().transactions, newTransaction];
      
      // Save to localStorage
      saveTransactionsToLocalStorage(updatedTransactions);
      
      // Update state
      set({ transactions: updatedTransactions });
      
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },
  
  // Delete transaction
  deleteTransaction: async (id) => {
    try {
      const updatedTransactions = get().transactions.filter(t => t.id !== id);
      
      // Save to localStorage
      saveTransactionsToLocalStorage(updatedTransactions);
      
      // Update state
      set({ transactions: updatedTransactions });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },
  
  // Update transaction
  updateTransaction: async (id, data) => {
    try {
      const transactions = get().transactions;
      const transactionIndex = transactions.findIndex(t => t.id === id);
      
      if (transactionIndex === -1) {
        throw new Error('Transaction not found');
      }
      
      const updatedTransaction = { 
        ...transactions[transactionIndex],
        ...data
      };
      
      const updatedTransactions = [
        ...transactions.slice(0, transactionIndex),
        updatedTransaction,
        ...transactions.slice(transactionIndex + 1)
      ];
      
      // Save to localStorage
      saveTransactionsToLocalStorage(updatedTransactions);
      
      // Update state
      set({ transactions: updatedTransactions });
      
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }
}));
