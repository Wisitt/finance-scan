export interface User {
  [x: string]: string | undefined;
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  is_system?: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  receipt_images?: string[];
  tags?: string[];
}

export interface ReceiptData {
  id?: string; // ใช้เมื่อดึงจาก database (optional สำหรับข้อมูลใหม่)
  user_id?: string; // ID ของผู้ใช้ที่อัปโหลด
  amount: number;
  date?: string;
  merchant?: string;
  tax_id?: string; // แก้ taxId เป็น tax_id ตามที่ error แจ้งไว้
  items?: Array<{name: string, price: number}>;
  details?: string;
  confidence: number;
  image_url?: string; // URL ของรูปใบเสร็จ
  created_at?: string; // วันที่สร้างข้อมูล
}

export interface Budget {
  id: string;
  user_id: string;
  category?: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  topCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}