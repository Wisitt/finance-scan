'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTransactionStore } from '@/store/transactionStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, PieChart, Plus, RefreshCw } from 'lucide-react';
import TransactionCharts from './components/TransactionCharts';
import AddTransactionForm from './components/form/AddTransactionForm';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TransactionList } from './components/list/TransactionList';

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('list');
  const [showMobileForm, setShowMobileForm] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const { fetchTransactions, transactions } = useTransactionStore();
  
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

  // Reset mobile form visibility when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setShowMobileForm(false);
    }
  }, [isMobile]);
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header with stats */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">รายการธุรกรรม</h1>
            <p className="text-muted-foreground mt-1">
              จัดการและติดตามรายรับรายจ่ายของคุณ
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchTransactions()}
              className="hidden md:flex items-center"
            >
            </Button> */}
            
            <Button 
              onClick={() => setShowMobileForm(true)} 
              className="md:hidden"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มธุรกรรม
            </Button>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side: Tabs and content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="md:col-span-2 bg-card rounded-xl shadow-sm border overflow-hidden"
          >
            <Tabs 
              defaultValue="list" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b bg-muted/30">
                <TabsList className="bg-transparent h-14 p-0 px-1">
                  <TabsTrigger 
                    value="list"
                    className="flex items-center gap-2 data-[state=active]:shadow-none data-[state=active]:bg-background rounded-none h-14 px-4 border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200"
                  >
                    <CreditCard className="h-4 w-4" />
                    รายการธุรกรรม
                  </TabsTrigger>
                  <TabsTrigger
                    value="analysis"
                    className="flex items-center gap-2 data-[state=active]:shadow-none data-[state=active]:bg-background rounded-none h-14 px-4 border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200"
                  >
                    <PieChart className="h-4 w-4" />
                    วิเคราะห์ข้อมูล
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="list" className="m-0 p-0">
                <div className="p-4">
                  <TransactionList />
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="m-0">
                <div className="p-4">
                  <TransactionCharts />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
          
          {/* Right side: Add transaction form (desktop only) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="sticky top-6">
              <AddTransactionForm />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Mobile form modal */}
      <AnimatePresence>
        {showMobileForm && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", bounce: 0.1 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 pt-16 pb-8 overflow-y-auto"
          >
            <div className="absolute top-4 right-4 z-10">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowMobileForm(false)}
                className="rounded-full"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </Button>
            </div>
            <div className="max-w-md mx-auto">
              <AddTransactionForm />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}