export { TransactionList } from './components/list/TransactionList';
export { default as AddTransactionForm } from './components/form/AddTransactionForm';
export { default as TransactionCharts } from './components/TransactionCharts'; 

// Add these definitions to your types file
export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
    date: string;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
    receipt_images?: string[];
    tags?: string[];
  }
  
  
  // Component props interfaces
  export interface AddTransactionFormProps {
    onSubmitSuccess?: () => void;
  }
  
  export interface TransactionChartsProps {
    transactions: Transaction[];
  }
  
  export interface TransactionListProps {
    showFilters?: boolean;
    showHeader?: boolean;
    showExport?: boolean;
    limitCount?: number;
    transactions?: Transaction[];
    searchTerm?: string;
  }
  
  export interface MobileFormOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }
  
  export interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
  
  export interface TransactionStatsProps {
    transactions: Transaction[];
    isLoading: boolean;
  }