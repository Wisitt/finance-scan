'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTransactionStore } from '@/store/transactionStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, PieChart, Plus, Eye, RefreshCw } from 'lucide-react';
import TransactionCharts from './components/TransactionCharts';
import AddTransactionForm from './components/form/AddTransactionForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TransactionList } from './components/list/TransactionList';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('list');
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [scanningActive, setScanningActive] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const { fetchTransactions, transactions } = useTransactionStore();
  
  // Load transactions when component mounts or session changes
  useEffect(() => {
    const loadData = async () => {
      if (session?.user) {
        try {
          setScanningActive(true);
          await fetchTransactions();
          setTimeout(() => setScanningActive(false), 1500);
        } catch (error) {
          console.error("Error loading transactions:", error);
          setScanningActive(false);
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
  
  // Handle refresh
  const handleRefresh = async () => {
    setScanningActive(true);
    try {
      await fetchTransactions();
      setTimeout(() => setScanningActive(false), 1500);
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      setScanningActive(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl relative">
      {/* Background scanning line animation */}
      {scanningActive && (
        <motion.div 
          className="absolute left-0 right-0 h-[1px] bg-primary/30 pointer-events-none" 
          animate={{ 
            top: ["0%", "100%", "0%"],
            opacity: [0, 0.5, 0]
          }}
          transition={{ 
            duration: 3,
            ease: "linear",
          }}
        />
      )}
      
      <div className="flex flex-col space-y-6">
        {/* Header with stats */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div 
                className="absolute -inset-1 rounded-full bg-primary/10" 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold">รายการธุรกรรม</h1>
                <Badge variant="outline" className="ml-3 bg-primary/5 border-primary/20 text-primary">
                  {transactions.length || 0}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                จัดการและติดตามรายรับรายจ่ายของคุณ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                className="hidden md:flex items-center border-primary/20 hover:bg-primary/5 hover:border-primary/30"
                disabled={scanningActive}
              >
                <RefreshCw className={cn(
                  "mr-2 h-4 w-4",
                  scanningActive && "animate-spin"
                )} />
                รีเฟรช
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setShowMobileForm(true)} 
                className="md:hidden bg-primary hover:bg-primary/90"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มธุรกรรม
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side: Tabs and content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="md:col-span-2 bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden"
          >
            <Tabs 
              defaultValue="list" 
              value={activeTab} 
              onValueChange={(value) => {
                setActiveTab(value);
                // Trigger scanning animation when switching tabs
                setScanningActive(true);
                setTimeout(() => setScanningActive(false), 1000);
              }}
              className="w-full"
            >
              <div className="border-b border-border/50 bg-muted/30 relative">
                {/* Active tab indicator */}
                <motion.div 
                  className="absolute bottom-0 h-[2px] bg-gradient-to-r from-primary via-primary to-accent"
                  layoutId="active-tab-indicator"
                  transition={{ type: "spring", damping: 20 }}
                  style={{ 
                    width: "120px",
                    left: activeTab === 'list' ? '20px' : '160px'
                  }}
                />
                
                <TabsList className="bg-transparent h-14 p-0 px-1">
                  <TabsTrigger 
                    value="list"
                    className="flex items-center gap-2 data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:bg-background/50 rounded-none h-14 px-4 border-b-2 border-transparent transition-all duration-200"
                    onClick={() => setActiveTab('list')}
                  >
                    <CreditCard className="h-4 w-4" />
                    รายการธุรกรรม
                    
                    {/* Scanning line for active tab */}
                    {activeTab === 'list' && (
                      <motion.div 
                        className="absolute left-4 right-4 h-[1px] bg-primary/30 pointer-events-none" 
                        animate={{ 
                          top: ["30%", "70%", "30%"],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ 
                          duration: 2, 
                          ease: "easeInOut", 
                          repeat: Infinity 
                        }}
                      />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="analysis"
                    className="flex items-center gap-2 data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:bg-background/50 rounded-none h-14 px-4 border-b-2 border-transparent transition-all duration-200"
                    onClick={() => setActiveTab('analysis')}
                  >
                    <PieChart className="h-4 w-4" />
                    วิเคราะห์ข้อมูล
                    
                    {/* Scanning line for active tab */}
                    {activeTab === 'analysis' && (
                      <motion.div 
                        className="absolute left-4 right-4 h-[1px] bg-primary/30 pointer-events-none" 
                        animate={{ 
                          top: ["30%", "70%", "30%"],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ 
                          duration: 2, 
                          ease: "easeInOut", 
                          repeat: Infinity 
                        }}
                      />
                    )}
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
            {/* Scanning line animation */}
            <motion.div 
              className="absolute left-0 right-0 h-[1px] bg-primary/30 pointer-events-none" 
              animate={{ 
                top: ["5%", "95%", "5%"],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ 
                duration: 6, 
                ease: "easeInOut", 
                repeat: Infinity 
              }}
            />
            
            <div className="absolute top-4 right-4 z-10">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowMobileForm(false)}
                  className="rounded-full hover:bg-primary/5 hover:text-primary"
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
              </motion.div>
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
