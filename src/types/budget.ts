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
  