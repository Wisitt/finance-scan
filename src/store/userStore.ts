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
  setCurrentUser: (user: Partial<User>) => Promise<void>;
  createUser: (name: string, email?: string, avatar_url?: string) => Promise<User>;
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
      
      setCurrentUser: async (user: Partial<User>) => {
        if (!user.id) {
          throw new Error('User ID is required');
        }
        
        set({ isLoading: true, error: null });
        try {
          // ตรวจสอบว่าผู้ใช้มีอยู่จริงในฐานข้อมูล
          const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error && error.code === 'PGRST116') { // Record not found
            console.log("User not found in database, creating new one:", user.name);
            
            // สร้างผู้ใช้ใหม่
            const newUser = await get().createUser(
              user.name || 'New User', 
              user.email,
              user.avatar_url
            );
            
            set({ currentUser: newUser, isLoading: false });
            return;
          } else if (error) {
            throw error;
          }
          
          // อัปเดตข้อมูลผู้ใช้ถ้าจำเป็น
          if (user.name || user.email || user.avatar_url) {
            const updateData: Partial<User> = {};
            let needsUpdate = false;
            
            if (user.name && existingUser.name !== user.name) {
              updateData.name = user.name;
              needsUpdate = true;
            }
            
            if (user.email && existingUser.email !== user.email) {
              updateData.email = user.email;
              needsUpdate = true;
            }
            
            if (user.avatar_url && existingUser.avatar_url !== user.avatar_url) {
              updateData.avatar_url = user.avatar_url;
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', existingUser.id)
                .select()
                .single();
                
              if (updateError) throw updateError;
              set({ currentUser: updatedUser, isLoading: false });
              return;
            }
          }
          
          // ใช้ข้อมูลที่มีอยู่แล้ว
          set({ currentUser: existingUser, isLoading: false });
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
      
      createUser: async (name: string, email?: string, avatar_url?: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('users')
            .insert([{ name, email, avatar_url }])
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