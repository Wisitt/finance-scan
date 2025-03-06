/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Transaction {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  note?: string | null;
  date: string;
  receipt_images?: string[];
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

interface TransactionState {
  transactions: Transaction[];
  categories: Category[]; // เพิ่ม categories ใน state
  loading: boolean;
  loadingTransactions: boolean; // เพิ่มตัวแปรสำหรับสถานะการโหลด transactions โดยเฉพาะ
  error: string | null;
  lastFetchedUserId: string | null;
  
  // เพิ่ม function
  fetchCategories: () => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<string | null>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  formatDateToUTC: (date: Date | string) => string;
}

// ฟังก์ชันสำหรับแปลงวันที่เป็นรูปแบบ UTC YYYY-MM-DD HH:MM:SS
const formatToUTCString = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: [], // เพิ่มตาม interface
      loading: false,
      loadingTransactions: false, // เพิ่มตาม interface
      error: null,
      lastFetchedUserId: null,
      
      formatDateToUTC: formatToUTCString,
      
      // เพิ่มฟังก์ชันใหม่สำหรับดึงข้อมูลหมวดหมู่
      fetchCategories: async () => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');
            
          if (error) throw error;
          
          set({ categories: data || [], loading: false });
        } catch (error: any) {
          console.error('Error fetching categories:', error);
          set({ error: error.message || 'Failed to fetch categories', loading: false });
        }
      },
      
      fetchTransactions: async (userId: string) => {
        if (!userId) {
          set({ error: 'User ID is required', loadingTransactions: false });
          return;
        }
        
        try {
          // ถ้าเป็น userId เดิมและมีข้อมูลอยู่แล้ว อาจพิจารณาไม่ดึงข้อมูลใหม่
          if (get().lastFetchedUserId === userId && get().transactions.length > 0) {
            return;
          }
          
          set({ loadingTransactions: true, error: null });
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
            
          if (error) throw error;
          
          // จัดรูปแบบวันที่ให้อยู่ในรูปแบบที่คงที่
          const formattedData = data.map(tx => ({
            ...tx,
            date: formatToUTCString(new Date(tx.date))
          }));
          
          set({ transactions: formattedData, loadingTransactions: false, lastFetchedUserId: userId });
        } catch (error: any) {
          console.error('Error fetching transactions:', error);
          set({ error: error.message || 'Failed to fetch transactions', loadingTransactions: false });
        }
      },
      
      addTransaction: async (transaction) => {
        try {
          set({ loading: true, error: null });
          
          // จัดรูปแบบวันที่ให้อยู่ในรูปแบบที่คงที่
          const formattedTransaction = {
            ...transaction,
            date: formatToUTCString(new Date(transaction.date))
          };
          
          const { data, error } = await supabase
            .from('transactions')
            .insert([formattedTransaction])
            .select()
            .single();
            
          if (error) throw error;
          
          set((state) => ({
            transactions: [data, ...state.transactions],
            loading: false
          }));
          
          return data.id;
        } catch (error: any) {
          console.error('Error adding transaction:', error);
          set({ error: error.message || 'Failed to add transaction', loading: false });
          return null;
        }
      },
      
      deleteTransaction: async (id: string) => {
        if (!id) {
          set({ error: 'Transaction ID is required', loading: false });
          return;
        }
        
        try {
          set({ loading: true, error: null });
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);
            
          if (error) throw error;
          
          set((state) => ({
            transactions: state.transactions.filter(t => t.id !== id),
            loading: false
          }));
        } catch (error: any) {
          console.error('Error deleting transaction:', error);
          set({ error: error.message || 'Failed to delete transaction', loading: false });
        }
      },
      
      updateTransaction: async (id: string, data: Partial<Transaction>) => {
        if (!id) {
          set({ error: 'Transaction ID is required', loading: false });
          return;
        }
        
        try {
          set({ loading: true, error: null });
          
          // จัดรูปแบบวันที่ให้อยู่ในรูปแบบที่คงที่ ถ้ามีการอัปเดตวันที่
          const updateData = { ...data };
          if (updateData.date) {
            updateData.date = formatToUTCString(new Date(updateData.date));
          }
          
          const { error } = await supabase
            .from('transactions')
            .update(updateData)
            .eq('id', id);
            
          if (error) throw error;
          
          set((state) => ({
            transactions: state.transactions.map(t => 
              t.id === id ? { ...t, ...updateData } : t
            ),
            loading: false
          }));
        } catch (error: any) {
          console.error('Error updating transaction:', error);
          set({ error: error.message || 'Failed to update transaction', loading: false });
        }
      }
    }),
    {
      name: 'transaction-store',
      // เก็บเฉพาะ transactions และ categories
      partialize: (state) => ({ 
        transactions: state.transactions,
        categories: state.categories 
      }),
    }
  )
);