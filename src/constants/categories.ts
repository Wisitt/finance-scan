import { Category } from '@/types';

export const defaultCategories: Category[] = [
  { id: 'exp1', name: 'อาหาร', type: 'expense' },
  { id: 'exp2', name: 'เดินทาง', type: 'expense' },
  { id: 'exp3', name: 'ช้อปปิ้ง', type: 'expense' },
  { id: 'exp4', name: 'บิล', type: 'expense' },
  { id: 'exp5', name: 'ความบันเทิง', type: 'expense' },
  { id: 'inc1', name: 'เงินเดือน', type: 'income' },
  { id: 'inc2', name: 'โบนัส', type: 'income' },
  { id: 'inc3', name: 'ขายของ', type: 'income' },
  { id: 'inc4', name: 'เงินโอน', type: 'income' },
  { id: 'inc5', name: 'อื่นๆ', type: 'income' },
];
