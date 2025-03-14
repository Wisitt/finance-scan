'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import AddTransactionForm from '@/app/components/AddTransactionForm';
import TransactionList from '@/app/components/TransactionList';
import { useCategoryStore } from '@/store/categoryStore';
import { useTransactionStore } from '@/store/transactionStore';

export default function TransactionsPage() {
  const { currentUser } = useUserStore();
  const { fetchCategories, categories } = useCategoryStore();
  const { fetchTransactions, transactions } = useTransactionStore();

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }

    if (currentUser?.id && transactions.length === 0) {
      fetchTransactions(currentUser.id);
    }
  }, [fetchCategories, currentUser?.id, fetchTransactions, categories.length, transactions.length]);

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">รายการธุรกรรม</h1>
        <p className="text-gray-500">จัดการรายรับรายจ่ายของคุณ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <AddTransactionForm />
        </div>
        <div>
          <TransactionList />
        </div>
      </div>
    </main>
  );
}
