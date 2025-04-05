import { Transaction } from '@/types';
import api, { ApiResponse, NewTransactionPayload } from './instance';

// GET
export async function fetchTransactionsAPI(userId: string): Promise<Transaction[]> {
  const response = await api.get<ApiResponse<Transaction[]>>(`/transactions?userId=${userId}`);
  if (response.data.error) throw new Error(response.data.error);
  return response.data.data;
}

// POST
export async function addTransactionAPI(transaction: NewTransactionPayload): Promise<Transaction> {
  const response = await api.post<ApiResponse<Transaction>>('/transactions', transaction);
  if (response.data.error) throw new Error(response.data.error);
  return response.data.data;
}

// DELETE
export async function deleteTransactionAPI(id: string, userId: string): Promise<void> {
  const response = await api.delete<ApiResponse<null>>(`/transactions/${id}?userId=${userId}`);
  if (response.data.error) throw new Error(response.data.error);
}
