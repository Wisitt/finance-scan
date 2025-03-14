// transactionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchTransactionsAPI, addTransactionAPI, deleteTransactionAPI } from '@/services/transactions';
import { Transaction } from '@/types';

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
  fetchTransactions: (userId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'> | Transaction) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],
      loading: false,
      error: null,

      fetchTransactions: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          const data = await fetchTransactionsAPI(userId);
          set({ transactions: data, loading: false });
        } catch (error) {
          set({ loading: false, error: error as Error });
        }
      },

      addTransaction: async (transaction) => {
        set({ loading: true, error: null });
        try {
          const savedTransaction = await addTransactionAPI(transaction);
          set((state) => ({
            transactions: [savedTransaction, ...state.transactions],
            loading: false,
          }));
          return savedTransaction;
        } catch (error) {
          set({ loading: false, error: error as Error });
          throw error;
        }
      },

      deleteTransaction: async (id) => {
        set({ loading: true, error: null });
        try {
          await deleteTransactionAPI(id);
          set((state) => ({
            transactions: state.transactions.filter((tx) => tx.id !== id),
            loading: false,
          }));
        } catch (error) {
          set({ loading: false, error: error as Error });
        }
      },
    }),
    { name: 'transaction-store' }
  )
);
