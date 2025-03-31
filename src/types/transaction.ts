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
  