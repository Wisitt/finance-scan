import { create } from 'zustand';
import { Category } from '@/types';
import { fetchCategoriesAPI, addCategoryAPI, updateCategoryAPI, deleteCategoryAPI } from '@/services/categories';


interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  fetchCategories: () => Promise<void>;
  addCategory: (payload: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    const data = await fetchCategoriesAPI();
    set({ categories: data });
  },

  addCategory: async (payload) => {
    try {
      const newCat = await addCategoryAPI(payload);
      set({ categories: [...get().categories, newCat] });
      return newCat;
    } catch (err) {
      throw err;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const updated = await updateCategoryAPI(id, data);
      set({
        categories: get().categories.map((cat) => (cat.id === id ? updated : cat)),
      });
      return updated;
    } catch (err) {
      throw err;
    }
  },

  deleteCategory: async (id) => {
    try {
      await deleteCategoryAPI(id);
      set({
        categories: get().categories.filter((cat) => cat.id !== id),
      });
    } catch (err) {
      throw err;
    }
  }
}));
