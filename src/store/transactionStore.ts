// transactionStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
// ลบ import supabase

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
        
        // Fetch from API
        const transactions = await fetchTransactionsAPI(userId);
        
        // Sort by date desc
        const sortedTransactions = [...transactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        set({ 
          transactions: sortedTransactions, 
          loading: false,
          dataFetched: true,
          lastFetchedUserId: userId
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({
        error: error instanceof Error ? error : new Error('Failed to fetch transactions'),
        loading: false
      });
    }
  },

  addTransaction: async (transactionData) => {
    try {
      // ดึง userId จาก session
      const session = await getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('No userId found in session');

      // สร้าง transaction ใหม่
      // (ใน NestJS ตัวอย่างอาจให้ Nest gen id เองก็ได้ แต่จะ gen ที่ Front-end ก็ไม่ผิด)
      const newTransaction = {
        ...transactionData,
        user_id: userId,
      } as Omit<Transaction, 'id' | 'created_at'> & { user_id: string };

      // เรียก Nest API
      const savedTransaction = await addTransactionAPI(newTransaction);

      // Update state
      set({ transactions: [...get().transactions, savedTransaction] });
      return savedTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      // ต้องส่ง userId ไปด้วย
      const session = await getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('No userId found in session');

      // ลบข้อมูลผ่าน Nest API
      await deleteTransactionAPI(id, userId);

      // Update state
      const updatedTransactions = get().transactions.filter((t) => t.id !== id);
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
