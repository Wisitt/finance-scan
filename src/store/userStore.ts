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
          const { data, error } = await supabase.from('users').select('*').order('name');

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

        const existingCurrentUser = get().currentUser;
        if (existingCurrentUser?.id === user.id) {
          // User already set, no need to re-fetch
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code === 'PGRST116') {
            // User not found, create new one
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

          // Update existing user if needed
          const updates: Partial<User> = {};
          let shouldUpdate = false;

          ['name', 'email', 'avatar_url'].forEach((field) => {
            if (user[field as keyof User] && user[field as keyof User] !== existingUser[field]) {
              updates[field as keyof User] = user[field as keyof User];
              shouldUpdate = true;
            }
          });

          if (shouldUpdate) {
            const { data: updatedUser, error: updateError } = await supabase
              .from('users')
              .update(updates)
              .eq('id', existingUser.id)
              .select()
              .single();

            if (updateError) throw updateError;

            set({ currentUser: updatedUser, isLoading: false });
            return;
          }

          set({ currentUser: existingUser, isLoading: false });
        } catch (error: any) {
          console.error('Error in setCurrentUser:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      validateCurrentUser: async () => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        try {
          const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', currentUser.id)
            .single();

          if (error || !data) {
            set({ currentUser: null });
          }
        } catch (error: any) {
          console.error('Error validating current user:', error);
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

          set((state) => ({
            users: [...state.users, data],
            currentUser: data,
            isLoading: false,
          }));

          return data;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({ currentUser: state.currentUser }),
      onRehydrateStorage: () => (state) => {
        state?.validateCurrentUser();
      },
    }
  )
);
