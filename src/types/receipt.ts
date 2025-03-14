export interface ReceiptData {
    id?: string;
    user_id?: string;
    amount: number;
    date?: string;
    merchant?: string;
    tax_id?: string;
    items?: Array<{ name: string; price: number }>;
    details?: string;
    confidence: number;
    image_url?: string;
    created_at?: string;
  }
  