import { Category } from '@/types';
import api from './instance';



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
