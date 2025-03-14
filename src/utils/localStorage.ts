import { Transaction } from '@/types';

export const getLocalTransactions = (userId: string): Transaction[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storedTransactions = localStorage.getItem('transactions');
    if (!storedTransactions) return [];
    
    const transactions: Transaction[] = JSON.parse(storedTransactions);
    return transactions.filter(tx => tx.user_id === userId);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

export const saveLocalTransaction = (transaction: Transaction): Transaction => {
  if (typeof window === 'undefined') return transaction;
  try {
    const transactions = getLocalTransactions(transaction.user_id);
    
    if (!transaction.id) {
      transaction.id = 'tx_' + Date.now() + Math.random().toString(36).substring(2, 9);
    }
    if (!transaction.created_at) {
      transaction.created_at = new Date().toISOString();
    }

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    return transaction;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw new Error('Failed to save transaction locally');
  }
};
