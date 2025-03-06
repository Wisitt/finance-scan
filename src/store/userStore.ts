/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  setCurrentUser: (user: User) => Promise<void>;
  createUser: (name: string) => Promise<User>;
  validateCurrentUser: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      isLoading: false,
      error: null,
      
      fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('name');
            
          if (error) throw error;
          
          set({ users: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      setCurrentUser: async (user: User) => {
        set({ isLoading: true, error: null });
        try {
          // ตรวจสอบว่าผู้ใช้มีอยู่จริงในฐานข้อมูล
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error && error.code === 'PGRST116') { // Record not found
            console.log("User not found in database, will create:", user.name);
            // ถ้าไม่พบผู้ใช้ในฐานข้อมูล ให้สร้างผู้ใช้ใหม่
            const newUser = await get().createUser(user.name || 'New User');
            set({ currentUser: newUser, isLoading: false });
            return;
          } else if (error) {
            throw error;
          }
          
          // พบผู้ใช้ในฐานข้อมูล
          set({ currentUser: data, isLoading: false });
        } catch (error: any) {
          console.error("Error in setCurrentUser:", error);
          set({ error: error.message, isLoading: false });
        }
      },
      
      validateCurrentUser: async () => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        try {
          // ตรวจสอบว่า currentUser ยังมีอยู่ในฐานข้อมูลหรือไม่
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          if (error || !data) {
            console.log("Current user not found in database, resetting");
            set({ currentUser: null });
          }
        } catch (error: any) {
          console.error("Error validating current user:", error);
        }
      },
      
      createUser: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('users')
            .insert([{ name }])
            .select()
            .single();
            
          if (error) throw error;
          
          // เพิ่มผู้ใช้ใหม่เข้าไปในรายการผู้ใช้
          set((state) => ({ 
            users: [...state.users, data],
            currentUser: data,
            isLoading: false
          }));
          
          return data;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'user-store',
      // เก็บเฉพาะ currentUser ใน persistent storage
      partialize: (state) => ({ currentUser: state.currentUser }),
      // ตรวจสอบข้อมูลผู้ใช้เมื่อโหลด store จาก persistent storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // ตรวจสอบความถูกต้องของ currentUser หลังจากโหลดข้อมูล
          state.validateCurrentUser();
        }
      }
    }
  )
);