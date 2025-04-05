import { create } from 'zustand';

import { Transaction } from '@/types';
import { getSession } from 'next-auth/react';
import { fetchTransactionsAPI, addTransactionAPI, deleteTransactionAPI } from '@/services/transactions';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
  dataFetched: boolean;
  lastFetchedUserId: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  resetTransactionState: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  dataFetched: false,
  lastFetchedUserId: null,
  
  fetchTransactions: async () => {
    try {
      // Get current session
      const session = await getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        throw new Error('No userId found in session');
      }
      
      // Check if we already fetched data for this user
      const lastFetchedUserId = get().lastFetchedUserId;
      const dataFetched = get().dataFetched;
      
      // Only fetch if: 
      // 1. We haven't fetched data yet, OR
      // 2. We're fetching for a different user than before
      if (!dataFetched || lastFetchedUserId !== userId) {
        set({ loading: true, error: null });
        
        try {
          // Fetch from API
          const response = await fetchTransactionsAPI(userId);
          
          // Add defensive check to ensure response is an array
          const transactions = Array.isArray(response) ? response : [];
          
          // Log what we received for debugging
          console.log(`Received ${transactions.length} transactions from API`);
          
          // Sort by date desc - only if we have transactions
          const sortedTransactions = transactions.length > 0 
            ? [...transactions].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              )
            : [];
          
          set({ 
            transactions: sortedTransactions, 
            loading: false,
            dataFetched: true,
            lastFetchedUserId: userId
          });
        } catch (apiError) {
          console.error('API call failed:', apiError);
          throw apiError; // Rethrow to be caught by the outer catch
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({
        error: error instanceof Error ? error : new Error('Failed to fetch transactions'),
        loading: false,
        // Ensure we have an empty array if fetching failed
        transactions: []
      });
    }
  },

  addTransaction: async (transactionData) => {
    try {
      // Get userId from session
      const session = await getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('No userId found in session');

      // Create new transaction
      const finalTransaction = {
        created_at: new Date().toISOString(),
        ...transactionData,
        user_id: userId,
      };
      
      if (!finalTransaction.user_id) throw new Error('user_id is required');

      // Call Nest API
      const savedTransaction = await addTransactionAPI(finalTransaction);

      // Update state - ensure we always have an array to spread
      const currentTransactions = Array.isArray(get().transactions) 
        ? get().transactions 
        : [];
        
      set({ transactions: [...currentTransactions, savedTransaction] });
      return savedTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      // Send userId
      const session = await getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('No userId found in session');

      // Delete via Nest API
      await deleteTransactionAPI(id, userId);

      // Update state - ensure we always have an array to filter
      const currentTransactions = Array.isArray(get().transactions) 
        ? get().transactions 
        : [];
        
      const updatedTransactions = currentTransactions.filter((t) => t.id !== id);
      set({ transactions: updatedTransactions });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  resetTransactionState: () => {
    set({
      transactions: [],
      loading: false,
      error: null,
      dataFetched: false,
      lastFetchedUserId: null
    });
  }
}));