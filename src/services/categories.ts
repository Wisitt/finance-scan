import axios from 'axios';
import { Category } from '@/types';

// ตั้ง baseURL ไปที่ NestJS server
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NEST_API_URL, // หรือใช้ process.env.NEXT_PUBLIC_API_BASE_URL
});

export async function fetchCategoriesAPI(): Promise<Category[]> {
  const res = await api.get('/categories');
  return res.data;
}

export async function addCategoryAPI(category: Omit<Category, 'id'>): Promise<Category> {
  const res = await api.post('/categories', category);
  return res.data;
}

export async function updateCategoryAPI(id: string, partial: Partial<Category>): Promise<Category> {
  const res = await api.put(`/categories/${id}`, partial);
  return res.data;
}

export async function deleteCategoryAPI(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
