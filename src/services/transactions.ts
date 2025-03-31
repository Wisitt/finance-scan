// services/transactionsApi.ts (ใหม่)
import { Transaction } from '@/types';
import api from './instance';



// GET
export async function fetchTransactionsAPI(userId: string): Promise<Transaction[]> {
  const { data } = await api.get(`/transactions?userId=${userId}`);
  if (data.error) throw new Error(data.error);
  return data;
}

// POST
export async function addTransactionAPI(transaction: any): Promise<Transaction> {
  const { data } = await api.post('/transactions', transaction);
  if (data.error) throw new Error(data.error);
  return data;
}


// DELETE
export async function deleteTransactionAPI(id: string, userId: string): Promise<void> {
  const { data } = await api.delete(`/transactions/${id}?userId=${userId}`);
  if (data.error) throw new Error(data.error);
}
