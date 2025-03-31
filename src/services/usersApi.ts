// services/usersApi.ts
import { User } from '@/types';
import api from './instance';


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
