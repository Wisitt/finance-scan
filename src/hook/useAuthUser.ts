'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useTransactionStore } from '@/store/transactionStore';

export function useAuthUser() {
  const { data: session, status } = useSession();
  const { currentUser, setCurrentUser, isLoading: userStoreLoading } = useUserStore();
  const { fetchTransactions } = useTransactionStore();

  useEffect(() => {
    const syncUserData = async () => {
      if (status === 'authenticated' && session?.user) {
        // ถ้าเป็น NextAuth user ให้สร้างหรือใช้ user จาก Supabase
        if (session.user.id && session.user.name) {
          // สร้าง/อัปเดต user ในฐานข้อมูล และตั้งค่าเป็น currentUser
          await setCurrentUser({
              id: session.user.id,
              name: session.user.name,
              email: session.user.email || '',
              avatar_url: session.user.image || session.user.avatar_url || '',
              created_at: ''
          });

          // โหลดธุรกรรมของผู้ใช้
          fetchTransactions(session.user.id);
        }
      }
    };

    syncUserData();
  }, [session, status, setCurrentUser, fetchTransactions]);

  return {
    user: session?.user || currentUser,
    isLoading: status === 'loading' || userStoreLoading,
    isAuthenticated: status === 'authenticated'
  };
}