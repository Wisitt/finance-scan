export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
    is_system?: boolean;
  }
  