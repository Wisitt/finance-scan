// services/transactionsApi.ts (ใหม่)
import axios from 'axios';
import { Transaction } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NEST_API_URL, // หรือใช้ env เช่น process.env.NEXT_PUBLIC_API_BASE_URL
});

// GET
export async function fetchTransactionsAPI(userId: string): Promise<Transaction[]> {
  const { data } = await api.get(`/transactions?userId=${userId}`);
  if (data.error) throw new Error(data.error);
  return data;
}

// POST
export async function addTransactionAPI(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  const { data } = await api.post('/transactions', transaction);
  if (data.error) throw new Error(data.error);
  return data;
}

// DELETE
export async function deleteTransactionAPI(id: string, userId: string): Promise<void> {
  const { data } = await api.delete(`/transactions/${id}?userId=${userId}`);
  if (data.error) throw new Error(data.error);
}
