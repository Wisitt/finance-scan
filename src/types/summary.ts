export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    topCategories: {
      category: string;
      amount: number;
      percentage: number;
    }[];
  }
  