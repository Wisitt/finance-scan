// services/usersApi.ts
import axios from 'axios';
import { User } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NEST_API_URL, // หรือ process.env.NEXT_PUBLIC_API_BASE_URL
});

export async function fetchUsers(): Promise<User[]> {
  const res = await api.get('/users');
  return res.data;
}

export async function getUserById(userId: string): Promise<User> {
  const res = await api.get(`/users/${userId}`);
  return res.data;
}

export async function createUser(name: string, email?: string, avatar_url?: string): Promise<User> {
  const res = await api.post('/users', { name, email, avatar_url });
  return res.data;
}

export async function updateUser(userId: string, payload: Partial<User>): Promise<User> {
  const res = await api.put(`/users/${userId}`, payload);
  return res.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}
