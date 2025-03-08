'use client';

import { useEffect } from 'react';

import { useUserStore } from '@/store/userStore';
import { useTransactionStore } from '@/store/transactionStore';
import AddTransactionForm from '@/app/components/AddTransactionForm';
import TransactionList from '@/app/components/TransactionList';


export default function TransactionsPage() {
  const { currentUser } = useUserStore();
  const { fetchTransactions, fetchCategories } = useTransactionStore();
  
  useEffect(() => {
    // โหลดข้อมูลหมวดหมู่เมื่อเข้าถึงหน้านี้
    fetchCategories();
    
    // โหลดธุรกรรมถ้ามีผู้ใช้ปัจจุบัน
    if (currentUser) {
      fetchTransactions(currentUser.id);
    }
  }, [fetchCategories, fetchTransactions, currentUser]);
  
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