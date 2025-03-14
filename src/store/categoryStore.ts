// categoryStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchCategoriesAPI } from '@/services/categories';
import { Category } from '@/types';

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: [],
      loading: false,
      error: null,

      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          const data = await fetchCategoriesAPI();
          set({ categories: data, loading: false });
        } catch (error) {
          set({ loading: false, error: error as Error });
        }
      },
    }),
    { name: 'category-store' }
  )
);
