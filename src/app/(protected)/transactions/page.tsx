'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useSession } from 'next-auth/react';
import { useCategoryStore } from '@/store/categoryStore';
import { useTransactionStore } from '@/store/transactionStore';
import TransactionCharts from './components/TransactionCharts';
import TransactionList from './components/TransactionList';
import AddTransactionForm from './components/AddTransactionForm';

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('list');
  
  const { fetchTransactions } = useTransactionStore();
  
  // Load transactions when component mounts or session changes
  useEffect(() => {
    const loadData = async () => {
      if (session?.user) {
        try {
          await fetchTransactions();
        } catch (error) {
          console.error("Error loading transactions:", error);
        }
      }
    };
    
    loadData();
  }, [session?.user, fetchTransactions]);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">ธุรกรรมทั้งหมด</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-card rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-3/4 p-4">
              <div className="mb-6">
                <div className="flex border-b">
                  <button
                    className={`pb-2 px-4 ${activeTab === 'list' ? 'border-b-2 border-primary text-primary font-medium' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('list')}
                  >
                    รายการธุรกรรม
                  </button>
                  <button
                    className={`pb-2 px-4 ${activeTab === 'analysis' ? 'border-b-2 border-primary text-primary font-medium' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('analysis')}
                  >
                    วิเคราะห์ข้อมูล
                  </button>
                </div>
              </div>
              
              {activeTab === 'list' ? (
                <TransactionList />
              ) : (
                <TransactionCharts />
              )}
            </div>
            
            <div className="w-full md:w-1/4 p-4 border-t md:border-t-0 md:border-l">
              <h2 className="text-lg font-medium mb-4">เพิ่มธุรกรรมใหม่</h2>
              <AddTransactionForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
