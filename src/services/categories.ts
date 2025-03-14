import { Category } from '@/types';
import axios from 'axios';
import { getSession } from 'next-auth/react';


const api = axios.create({
    baseURL: '/api', // กำหนด base URL
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const getAuthToken = async (): Promise<string | null> => {
    const session = await getSession();
    return session?.user?.id || null;
  };

// ✅ ดึงหมวดหมู่
export const fetchCategoriesAPI = async (): Promise<Category[]> => {
    const token = getAuthToken();
    if (!token) throw new Error('No auth token found');
  
    const { data } = await api.get('/categories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  };