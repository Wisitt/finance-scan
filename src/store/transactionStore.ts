import { create } from 'zustand';
import { Transaction, Category } from '@/types';

interface TransactionStore {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  error: Error | null;
  fetchTransactions: (userId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'> | Transaction) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  syncLocalTransactions: (userId: string) => Promise<void>;
}

// Create default categories
const defaultCategories: Category[] = [
  { id: 'exp1', name: 'อาหาร', type: 'expense' },
  { id: 'exp2', name: 'เดินทาง', type: 'expense' },
  { id: 'exp3', name: 'ช้อปปิ้ง', type: 'expense' },
  { id: 'exp4', name: 'บิล', type: 'expense' },
  { id: 'exp5', name: 'ความบันเทิง', type: 'expense' },
  { id: 'inc1', name: 'เงินเดือน', type: 'income' },
  { id: 'inc2', name: 'โบนัส', type: 'income' },
  { id: 'inc3', name: 'ขายของ', type: 'income' },
  { id: 'inc4', name: 'เงินโอน', type: 'income' },
  { id: 'inc5', name: 'อื่นๆ', type: 'income' }
];

// Helper functions for local storage
const getLocalTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedTransactions = localStorage.getItem('transactions');
    return storedTransactions ? JSON.parse(storedTransactions) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const saveLocalTransaction = (transaction: Transaction): Transaction => {
  if (typeof window === 'undefined') return transaction;
  
  try {
    const transactions = getLocalTransactions();
    
    // Generate ID if needed
    if (!transaction.id) {
      transaction.id = 'tx_' + Date.now() + Math.random().toString(36).substring(2, 9);
    }
    
    // Add created_at if missing
    if (!transaction.created_at) {
      transaction.created_at = new Date().toISOString();
    }
    
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    return transaction;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw new Error('Failed to save transaction locally');
  }
};

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  categories: [],
  loading: false,
  error: null,
  
  fetchTransactions: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      // Try to fetch from API
      const response = await fetch(`/api/transactions?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      set({ transactions: data, loading: false });
    } catch (error) {
      console.warn('API fetch failed, using local storage:', error);
      
      // Fallback to local storage
      const localTransactions = getLocalTransactions().filter(
        tx => tx.user_id === userId
      );
      
      set({ 
        transactions: localTransactions, 
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  },
  
  addTransaction: async (transaction) => {
    set({ loading: true, error: null });
    
    try {
      // Try to add via API first
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const savedTransaction = await response.json();
      
      set(state => ({
        transactions: [savedTransaction, ...state.transactions],
        loading: false
      }));
      
      return savedTransaction;
    } catch (error) {
      console.warn('API save failed, using local storage:', error);
      
      // Fallback to local storage
      const localTransaction = saveLocalTransaction(transaction as Transaction);
      
      set(state => ({
        transactions: [localTransaction, ...state.transactions],
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
      
      return localTransaction;
    }
  },
  
  deleteTransaction: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      // Try to delete via API
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Update state on success
      set(state => ({
        transactions: state.transactions.filter(tx => tx.id !== id),
        loading: false
      }));
    } catch (error) {
      console.warn('API delete failed, using local storage:', error);
      
      // Fallback to local storage
      if (typeof window !== 'undefined') {
        const transactions = getLocalTransactions().filter(tx => tx.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
      }
      
      set(state => ({
        transactions: state.transactions.filter(tx => tx.id !== id),
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  },
  
  fetchCategories: async () => {
    set({ loading: true, error: null });
    
    try {
      // Try to fetch from API
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      set({ categories: data, loading: false });
    } catch (error) {
      console.warn('API categories fetch failed, using defaults:', error);
      
      // Use default categories as fallback
      set({ 
        categories: defaultCategories,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  },
  
  syncLocalTransactions: async (userId: string) => {
    // This method syncs locally stored transactions to the server when connectivity is restored
    if (typeof window === 'undefined') return;
    
    const localTransactions = getLocalTransactions().filter(tx => tx.user_id === userId);
    if (localTransactions.length === 0) return;
    
    set({ loading: true });
    let successCount = 0;
    
    for (const transaction of localTransactions) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction),
        });
        
        if (response.ok) {
          successCount++;
        }
      } catch (error) {
        console.error('Failed to sync transaction:', error);
      }
    }
    
    if (successCount > 0) {
      // Clear synced transactions from local storage
      const remainingTransactions = getLocalTransactions().filter(
        tx => tx.user_id !== userId
      );
      localStorage.setItem('transactions', JSON.stringify(remainingTransactions));
      
      // Refresh transactions from server
      await get().fetchTransactions(userId);
    }
    
    set({ loading: false });
  }
}));

// Add listener for local storage events
if (typeof window !== 'undefined') {
  window.addEventListener('localTransactionAdded', ((event: CustomEvent) => {
    const { transaction } = event.detail;
    
    useTransactionStore.setState(state => ({
      transactions: [transaction, ...state.transactions]
    }));
  }) as EventListener);
}