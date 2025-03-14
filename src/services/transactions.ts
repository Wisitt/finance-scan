import axios from 'axios';
import { Transaction } from '@/types';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: '/api', // กำหนด base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ ฟังก์ชันช่วยดึง Token จาก Cookies
const getAuthToken = async (): Promise<string | null> => {
  const session = await getSession();
  return session?.user?.id || null;
};

// ✅ ดึงธุรกรรมของผู้ใช้
export const fetchTransactionsAPI = async (userId: string): Promise<Transaction[]> => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  const { data } = await api.get(`/transactions?user_id=${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// ✅ เพิ่มธุรกรรมใหม่
export const addTransactionAPI = async (transaction: Omit<Transaction, 'id'> | Transaction): Promise<Transaction> => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  const { data } = await api.post('/transactions', transaction, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// ✅ ลบธุรกรรม
export const deleteTransactionAPI = async (id: string): Promise<void> => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  await api.delete(`/transactions?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};



