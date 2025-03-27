/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { createUser, fetchUsers, getUserById, updateUser } from '@/services/usersApi';

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
          const data = await fetchUsers();
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
          // เรียก NestJS เพื่อเช็คว่า user มีจริงไหม
          // ถ้าไม่เจอ => error หรือจะสร้างใหม่ก็แล้วแต่ logic
          const existingUser = await getUserById(user.id);

          // ถ้าต้องการอัปเดตบาง field
          let shouldUpdate = false;
          const updates: Partial<User> = {};

          // สมมติอยากเช็ค field name, email, avatar_url
          if (user.name && user.name !== existingUser.name) {
            updates.name = user.name;
            shouldUpdate = true;
          }
          if (user.email && user.email !== existingUser.email) {
            updates.email = user.email;
            shouldUpdate = true;
          }
          if (user.avatar_url && user.avatar_url !== existingUser.avatar_url) {
            updates.avatar_url = user.avatar_url;
            shouldUpdate = true;
          }

          let updatedOrExisting = existingUser;
          if (shouldUpdate) {
            updatedOrExisting = await updateUser(user.id, updates);
          }

          set({ currentUser: updatedOrExisting, isLoading: false });
        } catch (error: any) {
          // ถ้า user ไม่เจอใน DB อาจสร้างใหม่
          if (error?.response?.status === 404) {
            // กรณี NestJS เขียน logic ถ้าไม่เจอจะ return 404
            const newUser = await get().createUser(
              user.name || 'New User',
              user.email,
              user.avatar_url
            );
            set({ currentUser: newUser, isLoading: false });
            return;
          }

          console.error('Error in setCurrentUser:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      validateCurrentUser: async () => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        try {
          // เรียก NestJS getUserById
          const check = await getUserById(currentUser.id);
          if (!check) {
            // ถ้า Nest บอกไม่เจอ user
            set({ currentUser: null });
          }
        } catch (error: any) {
          console.error('Error validating current user:', error);
          set({ currentUser: null });
        }
      },


     // 3) Create user via Nest
     createUser: async (name, email, avatar_url) => {
      set({ isLoading: true, error: null });

      try {
        const data = await createUser(name, email, avatar_url);
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

