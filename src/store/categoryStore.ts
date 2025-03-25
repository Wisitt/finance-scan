// categoryStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => Promise<Category>;
}

// Helper to save categories to localStorage
const saveCategoriesToLocalStorage = (categories: Category[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('categories', JSON.stringify(categories));
  }
};

// Default categories if none exist
const defaultCategories: Category[] = [
  { id: uuidv4(), name: 'การเดินทาง', type: 'expense', icon: 'Car', color: '#E91E63' },
  { id: uuidv4(), name: 'ช้อปปิ้ง', type: 'expense', icon: 'ShoppingBag', color: '#2196F3' },
  { id: uuidv4(), name: 'ที่พักอาศัย', type: 'expense', icon: 'Home', color: '#9C27B0' },
  { id: uuidv4(), name: 'บันเทิง', type: 'expense', icon: 'Film', color: '#03A9F4' },
  { id: uuidv4(), name: 'บิล/ค่าน้ำค่าไฟ', type: 'expense', icon: 'Zap', color: '#673AB7' },
  { id: uuidv4(), name: 'อาหาร', type: 'expense', icon: 'Utensils', color: '#FF5722' },
  { id: uuidv4(), name: 'เงินเดือน', type: 'income', icon: 'Briefcase', color: '#4CAF50' },
  { id: uuidv4(), name: 'เงินออม', type: 'income', icon: 'Piggy', color: '#FFEB3B' },
  { id: uuidv4(), name: 'ของขวัญ', type: 'income', icon: 'Gift', color: '#CDDC39' },
];

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  
  // Fetch categories from localStorage
  fetchCategories: async () => {
    try {
      set({ loading: true, error: null });
      
      if (typeof window !== 'undefined') {
        const savedCategories = localStorage.getItem('categories');
        let categories;
        
        if (savedCategories) {
          categories = JSON.parse(savedCategories);
        } else {
          // Initialize with default categories if none exist
          categories = defaultCategories;
          saveCategoriesToLocalStorage(categories);
        }
        
        set({ categories, loading: false });
      } else {
        set({ categories: [], loading: false });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch categories'),
        loading: false 
      });
    }
  },
  
  // Add new category
  addCategory: async (categoryData) => {
    try {
      const newCategory: Category = {
        id: uuidv4(),
        ...categoryData,
      };
      
      const updatedCategories = [...get().categories, newCategory];
      
      // Save to localStorage
      saveCategoriesToLocalStorage(updatedCategories);
      
      // Update state
      set({ categories: updatedCategories });
      
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },
  
  // Delete category
  deleteCategory: async (id) => {
    try {
      const updatedCategories = get().categories.filter(c => c.id !== id);
      
      // Save to localStorage
      saveCategoriesToLocalStorage(updatedCategories);
      
      // Update state
      set({ categories: updatedCategories });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
  
  // Update category
  updateCategory: async (id, data) => {
    try {
      const categories = get().categories;
      const categoryIndex = categories.findIndex(c => c.id === id);
      
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }
      
      const updatedCategory = { 
        ...categories[categoryIndex],
        ...data
      };
      
      const updatedCategories = [
        ...categories.slice(0, categoryIndex),
        updatedCategory,
        ...categories.slice(categoryIndex + 1)
      ];
      
      // Save to localStorage
      saveCategoriesToLocalStorage(updatedCategories);
      
      // Update state
      set({ categories: updatedCategories });
      
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }
}));
