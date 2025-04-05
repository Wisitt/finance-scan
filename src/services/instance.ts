import { Transaction } from '@/types';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});


export type NewTransactionPayload = Omit<Transaction, 'id'>;

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export default api;
